import requests
import json

def test_posts_api():
    print("🧪 Testing Posts API")
    print("=" * 50)
    
    # Test GET /api/posts
    try:
        print("1. Testing GET /api/posts...")
        response = requests.get('http://localhost:8000/api/posts')
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            posts = response.json()
            print(f"   ✅ Success: Found {len(posts)} posts")
            for post in posts:
                print(f"      - {post.get('title', 'No title')} (ID: {post.get('id', 'No ID')})")
        else:
            print(f"   ❌ Failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("-" * 30)
    
    # Test POST /api/posts
    try:
        print("2. Testing POST /api/posts...")
        test_post = {
            "title": "Test Post from API",
            "content": "This is a test post created via API",
            "author": "Test User",
            "slug": "test-post-api",
            "tags": ["test", "api"],
            "seo_title": "Test Post API",
            "seo_description": "Testing the posts API endpoint"
        }
        
        response = requests.post('http://localhost:8000/api/posts', json=test_post)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            created_post = response.json()
            print(f"   ✅ Success: Created post '{created_post.get('title')}'")
            print(f"   Post ID: {created_post.get('id')}")
        else:
            print(f"   ❌ Failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("=" * 50)

if __name__ == "__main__":
    test_posts_api()