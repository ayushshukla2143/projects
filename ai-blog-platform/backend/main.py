from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import google.generativeai as genai
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uvicorn
from bson import ObjectId
import json
import traceback

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Blog Platform", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🔧 Starting AI Blog Platform Backend...")

# MongoDB Atlas setup with better error handling
MONGODB_URI = os.getenv("MONGODB_URI")
print(f"📦 MongoDB URI: {MONGODB_URI}" if MONGODB_URI else "❌ MongoDB URI not set")

client = None
db = None
posts_collection = None
mongodb_connected = False

if MONGODB_URI and "your_mongodb_uri" not in MONGODB_URI:
    try:
        print("🔄 Connecting to MongoDB Atlas...")
        client = MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=15000,
            socketTimeoutMS=15000,
            retryWrites=True
        )
        # Test connection
        client.admin.command('ping')
        db = client["blog-platform"]
        posts_collection = db["posts"]
        mongodb_connected = True
        print("✅ MongoDB Atlas connected successfully!")
        
    except Exception as e:
        print(f"❌ MongoDB Atlas connection failed: {str(e)}")
        print("⚠️  Running in demo mode")
else:
    print("⚠️  MongoDB URI not configured. Running in demo mode")

# Gemini API setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"🔑 Gemini Key: {GEMINI_API_KEY[:10]}..." if GEMINI_API_KEY and "your_actual" not in GEMINI_API_KEY else "❌ Gemini API Key not set")

gemini_model = None
gemini_configured = False

if GEMINI_API_KEY and "your_actual" not in GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('models/gemini-pro-latest')
        gemini_configured = True
        print("✅ Gemini API configured successfully with gemini-pro-latest!")
    except Exception as e:
        print(f"❌ Gemini API configuration failed: {str(e)}")
else:
    print("⚠️  Gemini API key not configured")

# Pydantic models
class BlogPostCreate(BaseModel):
    title: str
    content: str
    author: str = "Anonymous"
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    slug: str
    tags: List[str] = []

class ContentGenerationRequest(BaseModel):
    prompt: str

# Helper function to convert MongoDB documents to JSON
def serialize_doc(doc):
    if doc is None:
        return None
    
    try:
        doc_dict = dict(doc)
        # Convert ObjectId to string
        if "_id" in doc_dict:
            doc_dict["id"] = str(doc_dict["_id"])
            del doc_dict["_id"]
        
        # Convert datetime objects to ISO format strings
        for key, value in doc_dict.items():
            if isinstance(value, datetime):
                doc_dict[key] = value.isoformat()
        
        return doc_dict
    except Exception as e:
        print(f"❌ Error serializing document: {e}")
        return {"error": "Failed to serialize document"}

@app.get("/")
async def root():
    return {
        "message": "AI Blog Platform API is running!",
        "status": "healthy",
        "database": "connected" if mongodb_connected else "demo_mode",
        "ai_service": "configured" if gemini_configured else "not_configured"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        db_status = "connected" if mongodb_connected else "demo_mode"
        ai_status = "configured" if gemini_configured else "not_configured"
        
        # Test database connection if connected
        db_healthy = False
        if mongodb_connected:
            try:
                # Simple query to test database
                posts_collection.find_one()
                db_healthy = True
            except Exception as e:
                print(f"❌ Database health check failed: {e}")
                db_healthy = False
        
        return {
            "status": "healthy",
            "database": db_status,
            "database_healthy": db_healthy,
            "ai_service": ai_status,
            "backend": "running",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return {
            "status": "error",
            "error": str(e),
            "backend": "running_with_errors"
        }

@app.post("/api/generate-content")
async def generate_content(request: ContentGenerationRequest):
    if not gemini_configured:
        raise HTTPException(
            status_code=503, 
            detail="AI service not configured. Please add GEMINI_API_KEY to .env file"
        )
    
    try:
        print(f"🤖 Generating content for: {request.prompt}")
        
        prompt = f"""Write a comprehensive blog post about: {request.prompt}

Please structure it as a proper blog post with:
- An engaging introduction
- Clear sections with headings (use ## for main headings)
- Informative content with practical examples
- A concluding summary
- Use markdown formatting

Make it engaging, well-structured, and valuable for readers."""

        response = gemini_model.generate_content(prompt)
        
        if response.text:
            print("✅ Content generated successfully!")
            return {"content": response.text}
        else:
            raise Exception("Empty response from AI")
            
    except Exception as e:
        print(f"❌ AI Generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/posts")
async def create_post(post: BlogPostCreate):
    try:
        print(f"📝 Creating new post: {post.title}")
        
        if not mongodb_connected:
            # Demo mode response
            demo_post = {
                "id": f"demo_{int(datetime.now().timestamp())}",
                "title": post.title,
                "content": post.content,
                "author": post.author,
                "slug": post.slug,
                "tags": post.tags,
                "seo_title": post.seo_title,
                "seo_description": post.seo_description,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            print("✅ Demo post created (MongoDB not connected)")
            return demo_post
        
        # Check if slug already exists
        existing_post = posts_collection.find_one({"slug": post.slug})
        if existing_post:
            raise HTTPException(status_code=400, detail="Slug already exists")
        
        post_data = {
            "title": post.title,
            "content": post.content,
            "author": post.author,
            "slug": post.slug,
            "tags": post.tags,
            "seo_title": post.seo_title,
            "seo_description": post.seo_description,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        print(f"💾 Inserting post into MongoDB: {post_data}")
        
        # Insert post
        result = posts_collection.insert_one(post_data)
        print(f"✅ Post inserted with ID: {result.inserted_id}")
        
        # Retrieve and return the created post
        created_post = posts_collection.find_one({"_id": result.inserted_id})
        if created_post:
            serialized_post = serialize_doc(created_post)
            print(f"✅ Post created successfully: {serialized_post['id']}")
            return serialized_post
        else:
            raise Exception("Failed to retrieve created post")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating post: {e}")
        print(f"🔍 Stack trace: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to create post: {str(e)}")

@app.get("/api/posts")
async def get_posts():
    try:
        print("📖 Fetching posts from database...")
        
        if not mongodb_connected:
            # Demo posts
            demo_posts = [
                {
                    "id": "demo_1",
                    "title": "Welcome to AI Blog Platform",
                    "content": "This is a demo post. Connect to MongoDB Atlas to save real posts.",
                    "author": "System",
                    "slug": "welcome-demo",
                    "tags": ["demo", "welcome"],
                    "seo_title": "Welcome Demo",
                    "seo_description": "Demo post for AI Blog Platform",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                }
            ]
            print("✅ Returning demo posts (MongoDB not connected)")
            return demo_posts
        
        # Get all posts from MongoDB
        print("🔍 Querying MongoDB for posts...")
        posts_cursor = posts_collection.find().sort("created_at", -1)
        posts_list = []
        
        for post in posts_cursor:
            serialized_post = serialize_doc(post)
            posts_list.append(serialized_post)
        
        print(f"✅ Found {len(posts_list)} posts in database")
        return posts_list
        
    except Exception as e:
        print(f"❌ Error fetching posts: {e}")
        print(f"🔍 Stack trace: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch posts: {str(e)}")

if __name__ == "__main__":
    print("\n🎉 Backend starting on http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/api/health")
    print(f"🗄️  Database: {'✅ MongoDB Atlas Connected' if mongodb_connected else '⚠️ Demo Mode'}")
    print(f"🤖 AI Service: {'✅ Configured' if gemini_configured else '⚠️ Not Configured'}")
    print("\nPress Ctrl+C to stop the server\n")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )