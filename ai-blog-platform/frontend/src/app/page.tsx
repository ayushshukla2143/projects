import Link from 'next/link'
import { blogAPI } from '@/lib/api'

// This is a Server Component
export default async function HomePage() {
  let healthStatus = {
    status: 'offline',
    database: 'unknown',
    ai_service: 'unknown',
    backend: 'not_responding'
  }
  
  try {
    healthStatus = await blogAPI.healthCheck()
  } catch (error) {
    console.log('Backend not available')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI-Powered Blog Platform
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Create amazing content with AI assistance
          </p>
          
          <Link 
            href="/create" 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
          >
            Create New Post
          </Link>
        </header>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">System Status</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Backend API:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                healthStatus.backend === 'running' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {healthStatus.backend === 'running' ? '✅ Running' : '❌ Not Available'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Database:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                healthStatus.database === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {healthStatus.database === 'connected' ? '✅ Connected' : '⚠️ Demo Mode'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">AI Service:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                healthStatus.ai_service === 'configured' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {healthStatus.ai_service === 'configured' ? '✅ Ready' : '⚠️ Needs API Key'}
              </span>
            </div>
          </div>

          {healthStatus.backend !== 'running' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700 font-medium">Backend Connection Issue</p>
              <p className="text-xs text-red-600 mt-1">
                Make sure your Python backend is running on port 8000
              </p>
              <code className="block mt-2 text-xs bg-red-100 p-2 rounded text-red-800">
                cd backend && python main.py
              </code>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-2xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">AI Content Generation</h3>
            <p className="text-gray-600">Generate blog posts instantly using Gemini AI with simple prompts.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-600 text-2xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Markdown Editor</h3>
            <p className="text-gray-600">Write and preview your content with real-time markdown rendering.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-purple-600 text-2xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">SEO Optimization</h3>
            <p className="text-gray-600">Get real-time SEO analysis and suggestions for better visibility.</p>
          </div>
        </div>
      </div>
    </div>
  )
}