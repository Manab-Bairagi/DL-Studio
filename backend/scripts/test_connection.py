"""
Test MongoDB Atlas connection
Run this to verify your connection is working
"""
import sys
import os
import asyncio

# Add project root to path (works from both backend/ and project root)
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
project_root = os.path.dirname(backend_dir)

# Add project root to Python path
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.core.config import settings
from motor.motor_asyncio import AsyncIOMotorClient

async def test_connection():
    """Test MongoDB Atlas connection"""
    print("=" * 60)
    print("Testing MongoDB Atlas Connection")
    print("=" * 60)
    print()
    
    # Mask password in URL for display
    db_url = settings.DATABASE_URL
    if '@' in db_url and '://' in db_url:
        try:
            protocol = db_url.split('://')[0] + '://'
            rest = db_url.split('://')[1]
            if '@' in rest:
                user_pass, host_db = rest.split('@', 1)
                if ':' in user_pass:
                    user = user_pass.split(':')[0]
                    masked_url = f"{protocol}{user}:***@{host_db}"
                else:
                    masked_url = f"{protocol}***@{host_db}"
            else:
                masked_url = db_url
        except:
            masked_url = "mongodb+srv://***:***@***/***"
    else:
        masked_url = db_url
    
    print(f"Connection String: {masked_url}")
    print(f"Database Name: {settings.DATABASE_NAME}")
    print()
    
    try:
        # Test connection
        client = AsyncIOMotorClient(settings.DATABASE_URL)
        
        # Test server info
        server_info = await client.server_info()
        print("✅ Connection successful!")
        print(f"   MongoDB Version: {server_info.get('version', 'Unknown')}")
        print()
        
        # Test database access
        db = client[settings.DATABASE_NAME]
        collections = await db.list_collection_names()
        
        print(f"✅ Database '{settings.DATABASE_NAME}' accessible")
        if collections:
            print(f"   Existing collections: {', '.join(collections)}")
        else:
            print("   No collections yet (will be created automatically)")
        print()
        
        # Test write access
        test_collection = db["connection_test"]
        result = await test_collection.insert_one({"test": True, "timestamp": "now"})
        await test_collection.delete_one({"_id": result.inserted_id})
        print("✅ Write access confirmed")
        print()
        
        print("=" * 60)
        print("All connection tests passed! ✅")
        print("=" * 60)
        
        client.close()
        return True
        
    except Exception as e:
        print("❌ Connection failed!")
        print(f"Error: {str(e)}")
        print()
        print("Troubleshooting steps:")
        print("1. Check your DATABASE_URL in .env file")
        print("2. Verify username and password are correct")
        print("3. Check if your IP is whitelisted in MongoDB Atlas")
        print("4. Verify network access settings in MongoDB Atlas")
        print("5. Check if cluster is running (not paused)")
        print()
        print("Common issues:")
        print("- Special characters in password need URL encoding")
        print("- IP address not whitelisted (try 'Allow Access from Anywhere')")
        print("- Cluster is paused (free tier pauses after inactivity)")
        print("- Wrong connection string format")
        print()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_connection())
    sys.exit(0 if success else 1)

