import requests
import json

def simple_test():
    print("🧪 Simple API Test")
    print("=" * 40)
    
    base_url = "http://localhost:8000"
    
    # Test 1: Basic health check
    print("1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/api/health")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Health: {data}")
        else:
            print(f"   ❌ Failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("-" * 30)
    
    # Test 2: Get posts (simple)
    print("2. Testing GET /api/posts...")
    try:
        response = requests.get(f"{base_url}/api/posts")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            posts = response.json()
            print(f"   ✅ Success: Got {len(posts)} posts")
        else:
            print(f"   ❌ Failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("=" * 40)

if __name__ == "__main__":
    simple_test()