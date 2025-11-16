'use client'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  height?: string
}

export default function MarkdownEditor({ 
  content, 
  onChange, 
  height = "400px" 
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-300 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              !showPreview 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              showPreview 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            👁️ Preview
          </button>
        </div>
        
        <div className="text-sm text-gray-500">
          {!showPreview ? 'Markdown supported' : 'Live preview'}
        </div>
      </div>
      
      {/* Editor/Preview Area */}
      <div className="p-1">
        {!showPreview ? (
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            style={{ height }}
            className="w-full p-4 border-0 focus:ring-0 font-mono text-sm resize-none text-gray-900 bg-white"
            placeholder="# Welcome to your new blog post! 

Start writing your content here using markdown...

## Features you can use:
- **Bold text** with ** 
- *Italic text* with *
- Lists with - or 1.
- [Links](http://example.com)
- `inline code`
- And much more!"
          />
        ) : (
          <div 
            style={{ height, maxHeight: height }}
            className="p-4 overflow-y-auto text-gray-900 bg-white"
          >
            {content ? (
              <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-em:text-gray-800 prose-ul:text-gray-800 prose-ol:text-gray-800 prose-li:text-gray-800 prose-blockquote:text-gray-700 prose-code:text-gray-900 prose-pre:text-gray-900 prose-a:text-blue-600">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-gray-500 italic">
                Nothing to preview yet. Start writing in the editor!
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer with quick tips */}
      {!showPreview && (
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-300">
          <div className="text-xs text-gray-600">
            <strong>Quick tips:</strong> Use # for headings, **text** for bold, *text* for italic
          </div>
        </div>
      )}
    </div>
  )
}