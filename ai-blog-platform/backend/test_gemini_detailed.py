import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

print("🔍 Detailed Gemini API Test - FIXED")
print("=" * 50)

# Get API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("❌ ERROR: GEMINI_API_KEY is empty")
    exit(1)

print(f"📏 API Key Length: {len(GEMINI_API_KEY)}")
print(f"🔑 First 20 chars: {GEMINI_API_KEY[:20]}...")

try:
    print("\n🔄 Configuring Gemini API...")
    genai.configure(api_key=GEMINI_API_KEY)
    print("✅ Configuration successful")

    print("\n📋 Listing available models...")
    models = genai.list_models()
    
    # Find the best available models
    recommended_models = []
    for model in models:
        if 'generateContent' in model.supported_generation_methods:
            if 'gemini-1.5' in model.name:
                recommended_models.append(model.name)
            elif 'gemini-pro' in model.name:
                recommended_models.append(model.name)
            elif 'gemini-2.0' in model.name and 'flash' in model.name:
                recommended_models.append(model.name)
    
    print("🎯 RECOMMENDED MODELS for this app:")
    for model in recommended_models[:5]:  # Show top 5
        print(f"   ✅ {model}")
    
    if not recommended_models:
        print("   ❌ No suitable models found!")
        exit(1)
    
    # Try models in order of preference
    model_priority = [
        'models/gemini-1.5-flash-latest',
        'models/gemini-1.5-pro-latest', 
        'models/gemini-2.0-flash-latest',
        'models/gemini-pro-latest',
        recommended_models[0]  # First available
    ]
    
    working_model = None
    for model_name in model_priority:
        try:
            print(f"\n🎯 Testing with: {model_name}")
            model = genai.GenerativeModel(model_name)
            
            print("💬 Sending test prompt...")
            response = model.generate_content("Hello, please respond with just 'AI is working!'")
            
            print(f"✅ SUCCESS with {model_name}!")
            print(f"📄 Response: {response.text}")
            print(f"📊 Response length: {len(response.text)} characters")
            
            working_model = model_name
            break
            
        except Exception as e:
            print(f"   ❌ {model_name} failed: {e}")
            continue
    
    if working_model:
        print(f"\n🎉 RECOMMENDED MODEL: {working_model}")
        print("💡 Update your main.py to use this model name")
    else:
        print("\n❌ All model tests failed!")
        
except Exception as e:
    print(f"❌ ERROR: {e}")
    print(f"❌ ERROR TYPE: {type(e).__name__}")

print("=" * 50)