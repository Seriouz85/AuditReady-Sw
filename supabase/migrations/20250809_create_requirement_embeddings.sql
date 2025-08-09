-- Create requirement_embeddings table for AI semantic mapping
-- This table stores vector embeddings for requirements to enable semantic similarity matching

-- Create the requirement_embeddings table
CREATE TABLE IF NOT EXISTS requirement_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id UUID NOT NULL,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('unified', 'framework', 'standard')),
  framework TEXT,
  title TEXT NOT NULL,
  description TEXT,
  embedding VECTOR(768), -- Gemini embedding-001 model dimensions
  indexed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_requirement_embeddings_requirement_id ON requirement_embeddings(requirement_id);
CREATE INDEX idx_requirement_embeddings_type ON requirement_embeddings(requirement_type);
CREATE INDEX idx_requirement_embeddings_framework ON requirement_embeddings(framework);
CREATE INDEX idx_requirement_embeddings_indexed_at ON requirement_embeddings(indexed_at);

-- Create vector similarity index for cosine similarity searches
-- This enables fast semantic similarity queries
CREATE INDEX idx_requirement_embeddings_cosine_similarity 
ON requirement_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable Row Level Security
ALTER TABLE requirement_embeddings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow authenticated users to read embeddings (for AI processing)
CREATE POLICY "Allow authenticated users to read requirement embeddings" ON requirement_embeddings
FOR SELECT TO authenticated
USING (true);

-- Allow system/service role to insert/update embeddings (for indexing process)
CREATE POLICY "Allow system role to manage requirement embeddings" ON requirement_embeddings
FOR ALL TO service_role
USING (true);

-- Allow admin users to manage embeddings
CREATE POLICY "Allow admin users to manage requirement embeddings" ON requirement_embeddings
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.role = 'admin'
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_requirement_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_requirement_embeddings_updated_at
BEFORE UPDATE ON requirement_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_requirement_embeddings_updated_at();

-- Create function for semantic similarity search
CREATE OR REPLACE FUNCTION find_similar_requirements(
  query_embedding VECTOR(768),
  similarity_threshold FLOAT DEFAULT 0.7,
  max_results INT DEFAULT 10,
  requirement_type_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  requirement_id UUID,
  title TEXT,
  description TEXT,
  framework TEXT,
  similarity_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    re.requirement_id,
    re.title,
    re.description,
    re.framework,
    1 - (re.embedding <=> query_embedding) AS similarity_score
  FROM requirement_embeddings re
  WHERE 
    (requirement_type_filter IS NULL OR re.requirement_type = requirement_type_filter)
    AND (1 - (re.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY re.embedding <=> query_embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION find_similar_requirements TO authenticated;

-- Create a view for easy access to embedding statistics
CREATE OR REPLACE VIEW requirement_embeddings_stats AS
SELECT 
  requirement_type,
  framework,
  COUNT(*) as embedding_count,
  MIN(indexed_at) as first_indexed,
  MAX(indexed_at) as last_indexed
FROM requirement_embeddings
GROUP BY requirement_type, framework;

-- Grant select on the view
GRANT SELECT ON requirement_embeddings_stats TO authenticated;

-- Add helpful comments
COMMENT ON TABLE requirement_embeddings IS 'Stores vector embeddings for requirements to enable AI-powered semantic similarity matching';
COMMENT ON COLUMN requirement_embeddings.embedding IS 'Vector embedding from Gemini embedding-001 model (768 dimensions)';
COMMENT ON FUNCTION find_similar_requirements IS 'Finds requirements with similar semantic meaning using cosine similarity';

-- Insert initial success message
DO $$
BEGIN
  RAISE NOTICE '✅ SUCCESS: requirement_embeddings table created successfully';
  RAISE NOTICE '🔧 NEXT STEP: Run SemanticMappingEngine.indexExistingRequirements() to populate embeddings';
  RAISE NOTICE '🚀 AI semantic mapping engine is ready for use!';
END $$;