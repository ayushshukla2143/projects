'use client'
import { useState, useEffect } from 'react'

interface SEOData {
  title: string
  content: string
  metaDescription: string
  slug?: string
}

interface SEOAnalysisResult {
  titleLength: number
  descriptionLength: number
  wordCount: number
  readingTime: number
  keywordDensity: { [key: string]: number }
  seoScore: number
  suggestions: string[]
}

export default function SEOAnalysis({ title, content, metaDescription, slug }: SEOData) {
  const [analysis, setAnalysis] = useState<SEOAnalysisResult>({
    titleLength: 0,
    descriptionLength: 0,
    wordCount: 0,
    readingTime: 0,
    keywordDensity: {},
    seoScore: 0,
    suggestions: []
  })

  useEffect(() => {
    const analyzeSEO = () => {
      // Basic metrics
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length
      const readingTime = Math.ceil(wordCount / 200) // 200 words per minute
      
      // Keyword analysis (simple version)
      const words = content.toLowerCase().split(/\s+/).filter(word => word.length > 3)
      const wordFrequency: { [key: string]: number } = {}
      
      words.forEach(word => {
        // Remove punctuation and common words
        const cleanWord = word.replace(/[^\w]/g, '')
        if (cleanWord.length > 3 && !['this', 'that', 'with', 'from', 'have', 'were'].includes(cleanWord)) {
          wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1
        }
      })
      
      // Get top 5 keywords
      const topKeywords = Object.entries(wordFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .reduce((acc, [key, value]) => {
          acc[key] = Math.round((value / words.length) * 100 * 100) / 100 // percentage
          return acc
        }, {} as { [key: string]: number })
      
      // Calculate SEO score (0-100)
      let score = 0
      const suggestions: string[] = []
      
      // Title check
      if (title.length >= 50 && title.length <= 60) {
        score += 25
      } else {
        suggestions.push(title.length < 50 ? 
          "Title is too short. Aim for 50-60 characters." : 
          "Title is too long. Keep it under 60 characters."
        )
      }
      
      // Description check
      if (metaDescription.length >= 120 && metaDescription.length <= 160) {
        score += 25
      } else {
        suggestions.push(metaDescription.length < 120 ? 
          "Meta description is too short. Aim for 120-160 characters." : 
          "Meta description is too long. Keep it under 160 characters."
        )
      }
      
      // Content length check
      if (wordCount >= 300) {
        score += 25
      } else {
        suggestions.push("Content is too short. Aim for at least 300 words for better SEO.")
      }
      
      // Reading time check
      if (readingTime >= 2) {
        score += 25
      } else {
        suggestions.push("Content might be too brief. Longer articles tend to rank better.")
      }
      
      // Add keyword suggestions if none found
      if (Object.keys(topKeywords).length === 0 && wordCount > 0) {
        suggestions.push("Consider adding more specific keywords to improve SEO.")
      }

      setAnalysis({
        titleLength: title.length,
        descriptionLength: metaDescription.length,
        wordCount,
        readingTime,
        keywordDensity: topKeywords,
        seoScore: score,
        suggestions: suggestions.length > 0 ? suggestions : ["Great! Your SEO looks good."]
      })
    }

    analyzeSEO()
  }, [title, content, metaDescription])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">SEO Analysis</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(analysis.seoScore)}`}>
          Score: {analysis.seoScore}/100
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="text-center">
          <div className={`text-2xl font-bold mb-1 ${analysis.titleLength >= 50 && analysis.titleLength <= 60 ? 'text-green-600' : 'text-red-600'}`}>
            {analysis.titleLength}
          </div>
          <p className="text-sm text-gray-600">Title Length</p>
          <p className="text-xs text-gray-500">Recommended: 50-60</p>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold mb-1 ${analysis.descriptionLength >= 120 && analysis.descriptionLength <= 160 ? 'text-green-600' : 'text-red-600'}`}>
            {analysis.descriptionLength}
          </div>
          <p className="text-sm text-gray-600">Meta Description</p>
          <p className="text-xs text-gray-500">Recommended: 120-160</p>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold mb-1 text-blue-600">
            {analysis.wordCount}
          </div>
          <p className="text-sm text-gray-600">Word Count</p>
          <p className="text-xs text-gray-500">Target: 300+</p>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold mb-1 text-purple-600">
            {analysis.readingTime}
          </div>
          <p className="text-sm text-gray-600">Reading Time</p>
          <p className="text-xs text-gray-500">Minutes</p>
        </div>
      </div>

      {/* Keyword Density */}
      {Object.keys(analysis.keywordDensity).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Top Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(analysis.keywordDensity).map(([keyword, density]) => (
              <div key={keyword} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {keyword} <span className="text-gray-500">({density}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Suggestions</h4>
        <div className="space-y-2">
          {analysis.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start text-sm">
              <span className="text-blue-500 mr-2">💡</span>
              <span className="text-gray-600">{suggestion}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Windows SEO Tip */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <span className="text-blue-600 mr-2">🌐</span>
          <div className="text-sm text-blue-700">
            <strong>Pro Tip:</strong> For better SEO, include your main keywords in the title, 
            first paragraph, and use subheadings throughout your content.
          </div>
        </div>
      </div>
    </div>
  )
}