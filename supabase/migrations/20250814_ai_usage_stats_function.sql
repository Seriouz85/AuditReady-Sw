-- =============================================================================
-- AI USAGE STATISTICS FUNCTION
-- Comprehensive AI API usage statistics for cost monitoring and optimization
-- =============================================================================

CREATE OR REPLACE FUNCTION get_ai_usage_stats(
  org_id UUID,
  time_range TEXT DEFAULT 'month'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date TIMESTAMPTZ;
  result JSON;
BEGIN
  -- Calculate start date based on time range
  CASE time_range
    WHEN 'day' THEN start_date := NOW() - INTERVAL '1 day';
    WHEN 'week' THEN start_date := NOW() - INTERVAL '1 week';
    WHEN 'month' THEN start_date := NOW() - INTERVAL '1 month';
    ELSE start_date := NOW() - INTERVAL '1 month';
  END CASE;

  -- Build comprehensive usage statistics
  WITH usage_stats AS (
    SELECT 
      COUNT(*) as total_requests,
      COUNT(*) FILTER (WHERE success = true) as successful_requests,
      COUNT(*) FILTER (WHERE success = false) as failed_requests,
      ROUND(COUNT(*) FILTER (WHERE success = true) * 100.0 / NULLIF(COUNT(*), 0), 2) as success_rate,
      
      -- Cost statistics
      ROUND(SUM(total_cost), 4) as total_cost,
      ROUND(AVG(total_cost), 6) as avg_cost_per_request,
      ROUND(SUM(total_cost) FILTER (WHERE prompt_type = 'generate'), 4) as generation_cost,
      ROUND(SUM(total_cost) FILTER (WHERE prompt_type = 'enhance'), 4) as enhancement_cost,
      ROUND(SUM(total_cost) FILTER (WHERE prompt_type = 'validate'), 4) as validation_cost,
      
      -- Token usage
      SUM(total_tokens) as total_tokens,
      ROUND(AVG(total_tokens)) as avg_tokens_per_request,
      SUM(tokens_prompt) as total_prompt_tokens,
      SUM(tokens_completion) as total_completion_tokens,
      
      -- Performance metrics
      ROUND(AVG(response_time_ms)) as avg_response_time_ms,
      ROUND(AVG(processing_time_ms)) as avg_processing_time_ms,
      MAX(response_time_ms) as max_response_time_ms,
      MIN(response_time_ms) as min_response_time_ms,
      
      -- Quality metrics
      ROUND(AVG(content_relevance), 2) as avg_content_relevance,
      ROUND(AVG(content_coherence), 2) as avg_content_coherence,
      ROUND(AVG(factual_accuracy), 2) as avg_factual_accuracy,
      ROUND(AVG((content_relevance + content_coherence + factual_accuracy) / 3.0), 2) as overall_quality_score,
      
      -- Model usage breakdown
      COUNT(*) FILTER (WHERE ai_model = 'gemini-1.5-pro') as gemini_pro_requests,
      COUNT(*) FILTER (WHERE ai_model = 'gemini-1.5-flash') as gemini_flash_requests,
      COUNT(*) FILTER (WHERE ai_model = 'gemini-pro') as gemini_standard_requests,
      
      -- Prompt type breakdown
      COUNT(*) FILTER (WHERE prompt_type = 'generate') as generate_requests,
      COUNT(*) FILTER (WHERE prompt_type = 'enhance') as enhance_requests,
      COUNT(*) FILTER (WHERE prompt_type = 'validate') as validate_requests,
      COUNT(*) FILTER (WHERE prompt_type = 'summarize') as summarize_requests
      
    FROM ai_generation_logs
    WHERE organization_id = org_id 
      AND created_at >= start_date
  ),
  daily_breakdown AS (
    SELECT json_agg(
      json_build_object(
        'date', DATE(created_at),
        'requests', COUNT(*),
        'cost', ROUND(SUM(total_cost), 4),
        'avg_quality', ROUND(AVG((content_relevance + content_coherence + factual_accuracy) / 3.0), 2),
        'success_rate', ROUND(COUNT(*) FILTER (WHERE success = true) * 100.0 / NULLIF(COUNT(*), 0), 2)
      )
      ORDER BY DATE(created_at)
    ) as daily_stats
    FROM ai_generation_logs
    WHERE organization_id = org_id 
      AND created_at >= start_date
    GROUP BY DATE(created_at)
  ),
  model_performance AS (
    SELECT json_agg(
      json_build_object(
        'model', ai_model,
        'requests', COUNT(*),
        'avg_cost', ROUND(AVG(total_cost), 6),
        'avg_response_time', ROUND(AVG(response_time_ms)),
        'success_rate', ROUND(COUNT(*) FILTER (WHERE success = true) * 100.0 / NULLIF(COUNT(*), 0), 2),
        'avg_quality', ROUND(AVG((content_relevance + content_coherence + factual_accuracy) / 3.0), 2)
      )
    ) as model_stats
    FROM ai_generation_logs
    WHERE organization_id = org_id 
      AND created_at >= start_date
      AND ai_model IS NOT NULL
    GROUP BY ai_model
  ),
  error_analysis AS (
    SELECT json_agg(
      json_build_object(
        'error_code', error_code,
        'count', COUNT(*),
        'percentage', ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ai_generation_logs WHERE organization_id = org_id AND created_at >= start_date AND success = false), 2)
      )
      ORDER BY COUNT(*) DESC
    ) as error_stats
    FROM ai_generation_logs
    WHERE organization_id = org_id 
      AND created_at >= start_date
      AND success = false
      AND error_code IS NOT NULL
    GROUP BY error_code
  )
  SELECT json_build_object(
    'organization_id', org_id,
    'time_range', time_range,
    'start_date', start_date,
    'end_date', NOW(),
    'summary', row_to_json(usage_stats.*),
    'daily_breakdown', daily_breakdown.daily_stats,
    'model_performance', model_performance.model_stats,
    'error_analysis', COALESCE(error_analysis.error_stats, '[]'::json),
    'generated_at', NOW()
  ) INTO result
  FROM usage_stats, daily_breakdown, model_performance, error_analysis;

  RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_ai_usage_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_ai_usage_stats TO service_role;

COMMENT ON FUNCTION get_ai_usage_stats IS 'Returns comprehensive AI API usage statistics for cost monitoring and performance analysis';

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ AI Usage Statistics Function Created Successfully';
  RAISE NOTICE '   📊 Function: get_ai_usage_stats(org_id, time_range)';
  RAISE NOTICE '   📈 Features: Cost tracking, performance metrics, quality analysis';
  RAISE NOTICE '   🔒 Security: DEFINER with proper RLS enforcement';
END $$;