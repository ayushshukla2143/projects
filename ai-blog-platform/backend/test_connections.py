import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import google.generativeai as genai

load_dotenv()

print("🧪 Testing Connections...")
print("=" * 50)

# Test MongoDB
MONGODB_URI = os.getenv("MONGODB_URI")
if MONGODB_URI:
    print("🔍 Testing MongoDB Atlas connection...")
    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("✅ MongoDB Atlas: CONNECTED")
        
        # Test database operations
        db = client["blog-platform"]
        posts = db["posts"]
        posts.insert_one({"test": "connection", "timestamp": "now"})
        posts.delete_one({"test": "connection"})
        print("✅ MongoDB Atlas: READ/WRITE WORKS")
        
    except Exception as e:
        print(f"❌ MongoDB Atlas: FAILED - {e}")
else:
    print("❌ MongoDB Atlas: NO CONNECTION STRING")

print("-" * 50)

# Test Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    print("🔍 Testing Gemini AI connection...")
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("Say 'Hello World' in 2 words.")
        print(f"✅ Gemini AI: CONNECTED - Response: {response.text}")
    except Exception as e:
        print(f"❌ Gemini AI: FAILED - {e}")
else:
    print("❌ Gemini AI: NO API KEY")

print("=" * 50)
print("🧪 Connection tests completed!")