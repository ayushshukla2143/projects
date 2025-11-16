'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { blogAPI } from '@/lib/api'

interface BlogPost {
  id: string
  title: string
  content: string
  author: string
  slug: string
  tags: string[]
  created_at: string
  updated_at: string
}

export default function PostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const postsData = await blogAPI.getPosts()
      setPosts(postsData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-blue-600 hover:text-blue-800 inline-flex items-center mb-2">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">All Blog Posts</h1>
          </div>
          <Link 
            href="/create" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Create New Post
          </Link>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading posts...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <p>Error loading posts: {error}</p>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Posts Yet</h2>
            <p className="text-gray-600 mb-6">Create your first blog post to get started!</p>
            <Link 
              href="/create" 
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition inline-block"
            >
              Create Your First Post
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-bold text-gray-900">{post.title}</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-gray-600 mb-3 line-clamp-3">
                {post.content.substring(0, 200)}...
              </p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    By: <strong>{post.author}</strong>
                  </span>
                  <span className="text-sm text-gray-500">
                    Slug: {post.slug}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  {post.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={loadPosts}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Refresh Posts
          </button>
        </div>
      </div>
    </div>
  )
}