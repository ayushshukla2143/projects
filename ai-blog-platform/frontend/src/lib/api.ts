import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for AI generation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to log requests
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data && config.url?.includes('generate-content')) {
      console.log(`📝 Prompt: ${config.data.prompt.substring(0, 50)}...`);
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      code: error.code
    });
    
    // Provide better error messages
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. The AI is taking longer than expected to generate content.';
    } else if (error.code === 'ECONNREFUSED') {
      error.message = 'Cannot connect to backend server. Make sure the Python backend is running on port 8000.';
    } else if (error.response?.status === 503) {
      error.message = 'AI service not available. Please check your API key configuration.';
    } else if (error.response?.status === 500) {
      error.message = 'Server error. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

// API functions
export const blogAPI = {
  // Generate AI content
  generateContent: async (prompt: string) => {
    try {
      console.log('🤖 Starting AI content generation...');
      const response = await api.post('/api/generate-content', { prompt });
      console.log('✅ AI content generated successfully!');
      return response.data;
    } catch (error: any) {
      console.error('AI Generation Failed:', error);
      
      // Specific timeout handling
      if (error.code === 'ECONNABORTED') {
        throw new Error('AI generation is taking too long. This can happen with complex prompts. Please try a simpler prompt or try again.');
      }
      
      throw new Error(error.message || 'Failed to generate content');
    }
  },

  // Create new post
  createPost: async (postData: any) => {
    try {
      console.log('📝 Creating new post:', { 
        title: postData.title,
        author: postData.author,
        slug: postData.slug 
      });
      const response = await api.post('/api/posts', postData);
      console.log('✅ Post created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Create Post Failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = error.message || 'Failed to create post';
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        errorMessage = 'Slug already exists. Please choose a different URL slug.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error while creating post. Please try again.';
      }
      
      throw new Error(errorMessage);
    }
  },

  // Get all posts
  getPosts: async () => {
    try {
      console.log('📖 Fetching posts from API...');
      const response = await api.get('/api/posts');
      console.log('✅ Posts fetched successfully. Count:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get Posts Failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Return demo data if API fails
      return [
        {
          id: "demo_1",
          title: "Welcome to AI Blog Platform",
          content: "This is a demo post. The posts API is currently unavailable.",
          author: "System",
          slug: "welcome-demo",
          tags: ["demo"],
          seo_title: "Welcome Demo",
          seo_description: "Demo post for AI Blog Platform",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
  },

  // Get single post
  getPost: async (postId: string) => {
    try {
      const response = await api.get(`/api/posts/${postId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get Post Failed:', error);
      throw new Error(`Failed to fetch post: ${error.message}`);
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error: any) {
      console.error('Health Check Failed:', error);
      return {
        status: 'offline',
        database: 'unknown',
        ai_service: 'unknown',
        backend: 'not_responding',
        error: error.message
      };
    }
  },
};

// Export the api instance if needed elsewhere
export { api };