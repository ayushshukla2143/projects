import pkg_resources

required_packages = [
    'fastapi',
    'uvicorn', 
    'pymongo',
    'google-generativeai',
    'python-dotenv',
    'pydantic'
]

print("🔍 Checking Package Installation")
print("=" * 40)

for package in required_packages:
    try:
        dist = pkg_resources.get_distribution(package)
        print(f"✅ {package}: {dist.version}")
    except pkg_resources.DistributionNotFound:
        print(f"❌ {package}: NOT INSTALLED")

print("=" * 40)