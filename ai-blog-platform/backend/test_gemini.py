import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

print("🧪 Testing Gemini FREE API...")
print(f"API Key: {GEMINI_API_KEY[:10]}..." if GEMINI_API_KEY else "❌ No API Key")

if GEMINI_API_KEY and GEMINI_API_KEY != "your_actual_gemini_api_key_here":
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("Say 'Hello World' in 2 words.")
        print("✅ Gemini FREE API is WORKING!")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Gemini API Error: {e}")
else:
    print("❌ Please set your GEMINI_API_KEY in .env file")