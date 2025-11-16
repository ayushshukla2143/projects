'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MarkdownEditor from '@/components/MarkdownEditor'
import AIAssistant from '@/components/AIAssistant'
import SEOAnalysis from '@/components/SEOAnalysis'
import Link from 'next/link'
import { blogAPI } from '@/lib/api'

export default function CreatePostPage() {
  const router = useRouter()
  
  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [tags, setTags] = useState('')
  const [author, setAuthor] = useState('')
  const [slug, setSlug] = useState('')
  
  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 50)
      setSlug(generatedSlug)
    }
  }, [title, slug])

  // Auto-generate meta description from content
  useEffect(() => {
    if (content && !metaDescription) {
      const firstParagraph = content.split('\n\n')[0]
      const description = firstParagraph
        .replace(/[#*`]/g, '') // Remove markdown
        .substring(0, 150)
        .trim()
      if (description.length > 0) {
        setMetaDescription(description + (description.length === 150 ? '...' : ''))
      }
    }
  }, [content, metaDescription])

  const handleContentGenerated = (generatedContent: string) => {
    setContent(generatedContent)
  }

  const handleSave = async (publish: boolean = true) => {
    if (!title.trim()) {
      setSaveError('Title is required')
      return
    }

    if (!content.trim()) {
      setSaveError('Content is required')
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        metaDescription: metaDescription.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        author: author.trim() || 'Anonymous',
        slug: slug.trim() || generateSlug(title),
        seo_title: title.trim(),
        seo_description: metaDescription.trim()
      }

      console.log('📤 Sending post data:', postData)
      
      await blogAPI.createPost(postData)
      
      setSaveSuccess(true)
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push('/')
      }, 2000)

    } catch (error: any) {
      console.error('Save error:', error)
      
      let errorMessage = error.message || 'Unknown error occurred'
      
      if (errorMessage.includes('Network Error')) {
        errorMessage = 'Cannot connect to backend server. Please make sure the backend is running on port 8000.'
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.'
      }
      
      setSaveError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <Link href="/" className="text-blue-600 hover:text-blue-800 inline-flex items-center mb-2 text-lg">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
            <p className="text-gray-700 mt-2">Write your blog post with AI assistance and SEO optimization</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition font-medium"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition flex items-center font-medium"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  Publish Post
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="mr-2">✅</span>
              <span className="font-medium">Post published successfully! Redirecting...</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="mr-2">❌</span>
              <span className="font-medium">{saveError}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            <AIAssistant onContentGenerated={handleContentGenerated} />

            {/* Post Details Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Post Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Post Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a compelling title for your post..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white text-lg font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slug
                    </label>
                    <input
                      id="slug"
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="url-slug-for-seo"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                      Author Name
                    </label>
                    <input
                      id="author"
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Your name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                    </label>
                  <textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Brief description for search engines..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    id="tags"
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="technology, ai, blogging (comma separated)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Content</h2>
              <MarkdownEditor 
                content={content} 
                onChange={setContent}
                height="500px"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <SEOAnalysis 
              title={title}
              content={content}
              metaDescription={metaDescription}
              slug={slug}
            />
          </div>
        </div>
      </div>
    </div>
  )
}