'use client'
import { useState } from 'react'
import { blogAPI } from '@/lib/api'

interface AIAssistantProps {
  onContentGenerated: (content: string) => void
  disabled?: boolean
}

const SUGGESTED_PROMPTS = [
  "Write a blog post about the benefits of artificial intelligence in everyday life",
  "Create a guide for beginners learning web development",
  "Discuss the future of renewable energy and sustainable technology",
  "Write about healthy lifestyle habits and their impact on productivity",
  "Explain machine learning concepts in simple terms for beginners"
]

export default function AIAssistant({ onContentGenerated, disabled = false }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const generateContent = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt
    
    if (!finalPrompt.trim()) {
      setError('Please enter a prompt or select a suggestion')
      return
    }
    
    setIsGenerating(true)
    setError(null)
    setProgress(0)
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90 // Cap at 90% until complete
        return prev + 10
      })
    }, 1000)
    
    try {
      console.log('🔄 Generating content with prompt:', finalPrompt)
      const response = await blogAPI.generateContent(finalPrompt)
      
      clearInterval(progressInterval)
      setProgress(100)
      
      if (response.content) {
        onContentGenerated(response.content)
        setPrompt('')
        setError(null)
        
        // Reset progress after success
        setTimeout(() => setProgress(0), 1000)
      } else {
        throw new Error('No content received from AI service')
      }
    } catch (error: any) {
      clearInterval(progressInterval)
      setProgress(0)
      console.error('AI Generation Error:', error)
      
      let errorMessage = error.message || 'Failed to generate content'
      
      // Provide specific error messages
      if (errorMessage.includes('timeout') || errorMessage.includes('longer than expected')) {
        errorMessage = 'AI generation is taking longer than expected. This can happen with complex prompts. Please try a simpler prompt or try again in a moment.'
      } else if (errorMessage.includes('AI service not available')) {
        errorMessage = 'AI service is not available. Please check your backend configuration.'
      }
      
      setError(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion)
    generateContent(suggestion)
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-3 rounded-lg mr-4">
          <span className="text-blue-600 text-xl">🤖</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">AI Content Assistant</h3>
          <p className="text-gray-600">Generate blog content instantly with AI</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <span className="text-red-500 mr-2 mt-0.5">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <p className="text-red-600 text-sm mt-1">
                <strong>Tip:</strong> Try simpler prompts or check if your backend is running properly.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Progress Bar */}
        {isGenerating && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between text-sm text-gray-700 mb-2">
              <span className="font-medium">Generating content...</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              AI generation can take 10-30 seconds for complex topics...
            </p>
          </div>
        )}

        {/* Quick Suggestions */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-3">
            Quick Start Suggestions:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SUGGESTED_PROMPTS.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isGenerating || disabled}
                className="text-left p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">💡</span>
                  <span className="text-sm leading-relaxed">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt */}
        <div>
          <label htmlFor="ai-prompt" className="block text-lg font-semibold text-gray-800 mb-3">
            Or write your own prompt:
          </label>
          <div className="flex gap-3">
            <input
              id="ai-prompt"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What would you like to write about? e.g., 'Write about climate change solutions'"
              className="flex-1 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
              disabled={isGenerating || disabled}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isGenerating) {
                  generateContent()
                }
              }}
            />
            <button
              onClick={() => generateContent()}
              disabled={isGenerating || !prompt.trim() || disabled}
              className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center whitespace-nowrap font-medium"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <span className="mr-2 text-lg">✨</span>
                  Generate
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Tip:</strong> Keep prompts clear and specific. Complex topics may take longer to generate.
          </p>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-blue-600 mr-3 text-lg">💡</span>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Generation Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Simple, clear prompts</strong> work best and generate faster</li>
                <li>• Generation typically takes <strong>10-30 seconds</strong></li>
                <li>• Complex topics may take longer to process</li>
                <li>• If timeout occurs, try a simpler version of your prompt</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}