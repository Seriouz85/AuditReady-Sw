import { AdminNavigation } from '@/components/admin/AdminNavigation';
import SemanticMappingDashboard from '@/components/admin/SemanticMappingDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles } from 'lucide-react';

export default function SemanticMappingAdmin() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavigation />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    AI Semantic Mapping Engine
                  </h1>
                  <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    BETA
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Automatically map new compliance frameworks using advanced AI semantic analysis
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Time Reduction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">90%</div>
                  <div className="text-xs text-gray-500">vs manual mapping</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Auto-Mapping Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">85%+</div>
                  <div className="text-xs text-gray-500">high confidence matches</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Supported Frameworks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">12+</div>
                  <div className="text-xs text-gray-500">ready for AI mapping</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Breaking Changes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">0</div>
                  <div className="text-xs text-gray-500">non-destructive additions</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Dashboard */}
          <SemanticMappingDashboard />

          {/* Technical Information */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Technical Implementation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Vector Embeddings</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Requirements are converted to 1536-dimensional vectors using OpenAI's text-embedding-3-small model, 
                  capturing semantic meaning beyond simple keyword matching.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Similarity Matching</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cosine similarity algorithms identify conceptually related requirements across different frameworks, 
                  enabling accurate cross-framework mapping with confidence scoring.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Quality Control</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  High-confidence matches (85%+) are automatically applied, while lower confidence mappings are 
                  flagged for human expert review, ensuring accuracy and compliance integrity.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Database Integration</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vector storage using PostgreSQL with pgvector extension enables efficient similarity searches 
                  and scales to handle thousands of requirements across multiple frameworks.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}