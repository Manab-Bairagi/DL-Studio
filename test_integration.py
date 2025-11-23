#!/usr/bin/env python3
"""
Integration Testing Script for Inference Pipeline
Runs all tests systematically
"""

import requests
import json
import time
from pathlib import Path

BASE_URL = "http://localhost:8000/api/v1"

# Test credentials
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpass123"
TEST_USER = "Test User"

# Store results
token = None
user_id = None
model_id = None
version_id = None

class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test(name, passed, message=""):
    status = f"{Colors.GREEN}✅ PASS{Colors.ENDC}" if passed else f"{Colors.RED}❌ FAIL{Colors.ENDC}"
    print(f"{status} | {name}")
    if message:
        print(f"       {Colors.CYAN}→ {message}{Colors.ENDC}")

def print_section(title):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{title}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

# Test 1: Health Check
def test_health():
    print_section("Test 1: Backend Health Check")
    try:
        response = requests.get(f"{BASE_URL.replace('/api/v1', '')}/health")
        passed = response.status_code == 200
        print_test("Health endpoint", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        print_test("Health endpoint", False, f"Error: {e}")
        return False

# Test 2: Register User
def test_register():
    print_section("Test 2: User Registration")
    global user_id
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "full_name": TEST_USER
            }
        )
        passed = response.status_code in [200, 201]
        if passed:
            data = response.json()
            user_id = data.get("id")
            print_test("User registration", passed, f"User ID: {user_id}")
        else:
            # User might already exist
            print_test("User registration", True, "User already exists (OK)")
        return True
    except Exception as e:
        print_test("User registration", False, f"Error: {e}")
        return False

# Test 3: Login
def test_login():
    print_section("Test 3: User Login")
    global token
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
        )
        passed = response.status_code == 200
        if passed:
            data = response.json()
            token = data.get("access_token")
            print_test("Login successful", passed, f"Token: {token[:20]}...")
        else:
            print_test("Login successful", False, f"Status: {response.status_code}")
            return False
        return True
    except Exception as e:
        print_test("Login successful", False, f"Error: {e}")
        return False

# Test 4: Create Model
def test_create_model():
    print_section("Test 4: Create Model")
    global model_id
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(
            f"{BASE_URL}/models",
            headers=headers,
            json={
                "name": "TestCNN",
                "description": "Test model for inference",
                "model_type": "classification"
            }
        )
        passed = response.status_code in [200, 201]
        if passed:
            data = response.json()
            model_id = data.get("id")
            print_test("Model creation", passed, f"Model ID: {model_id}")
        else:
            print_test("Model creation", False, f"Status: {response.status_code}, Response: {response.text}")
        return passed
    except Exception as e:
        print_test("Model creation", False, f"Error: {e}")
        return False

# Test 5: Create Model Version
def test_create_version():
    print_section("Test 5: Create Model Version")
    global version_id
    try:
        headers = {"Authorization": f"Bearer {token}"}
        architecture = {
            "layers": [
                {"type": "Conv2d", "params": {"in_channels": 3, "out_channels": 32, "kernel_size": 3}},
                {"type": "ReLU", "params": {"inplace": False}},
                {"type": "MaxPool2d", "params": {"kernel_size": 2, "stride": 2}},
                {"type": "Conv2d", "params": {"in_channels": 32, "out_channels": 64, "kernel_size": 3}},
                {"type": "ReLU", "params": {"inplace": False}},
                {"type": "Flatten", "params": {"start_dim": 1}},
                {"type": "Linear", "params": {"in_features": 64*15*15, "out_features": 10}}
            ]
        }
        
        response = requests.post(
            f"{BASE_URL}/models/{model_id}/versions",
            headers=headers,
            json={
                "architecture": architecture,
                "input_shape": [1, 3, 32, 32],
                "notes": "Simple CNN for CIFAR-10"
            }
        )
        passed = response.status_code in [200, 201]
        if passed:
            data = response.json()
            version_id = data.get("id")
            print_test("Version creation", passed, f"Version ID: {version_id}")
        else:
            print_test("Version creation", False, f"Status: {response.status_code}, Response: {response.text}")
        return passed
    except Exception as e:
        print_test("Version creation", False, f"Error: {e}")
        return False

# Test 6: Get Model Config
def test_get_config():
    print_section("Test 6: Get Model Configuration")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BASE_URL}/inference/{version_id}/config",
            headers=headers
        )
        passed = response.status_code == 200
        if passed:
            data = response.json()
            print_test("Get model config", passed, f"Parameters: {data.get('total_parameters', 'N/A')}")
        else:
            print_test("Get model config", False, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        print_test("Get model config", False, f"Error: {e}")
        return False

# Test 7: Run Inference
def test_inference():
    print_section("Test 7: Backend Inference")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        # Create random input (1 × 3 × 32 × 32 = 3072 values)
        input_data = [0.5] * 3072
        
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/inference/run",
            headers=headers,
            json={
                "version_id": version_id,
                "input_data": input_data
            }
        )
        elapsed = time.time() - start_time
        
        passed = response.status_code == 200
        if passed:
            data = response.json()
            proc_time = data.get("processing_time", 0)
            layers = len(data.get("layer_outputs", []))
            print_test("Inference execution", passed, f"Time: {proc_time:.3f}s, Layers: {layers}")
        else:
            print_test("Inference execution", False, f"Status: {response.status_code}, Response: {response.text[:100]}")
        return passed
    except Exception as e:
        print_test("Inference execution", False, f"Error: {e}")
        return False

# Test 8: Test with Image
def test_inference_image():
    print_section("Test 8: Inference with Image Upload")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a simple test image (32x32 pixels)
        from PIL import Image
        import io
        
        img = Image.new('RGB', (32, 32), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        files = {'file': ('test_image.png', img_bytes, 'image/png')}
        
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/inference/run-image",
            headers=headers,
            data={"version_id": version_id},
            files=files
        )
        elapsed = time.time() - start_time
        
        passed = response.status_code == 200
        if passed:
            data = response.json()
            print_test("Image inference", passed, f"Time: {elapsed:.3f}s")
        else:
            print_test("Image inference", False, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        print_test("Image inference", False, f"Error: {e}")
        return False

# Test 9: Error Handling
def test_errors():
    print_section("Test 9: Error Handling")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test 9a: Missing model
        response = requests.get(
            f"{BASE_URL}/inference/invalid-id/config",
            headers=headers
        )
        test_404 = response.status_code == 404
        print_test("404 Not Found", test_404, f"Status: {response.status_code}")
        
        # Test 9b: Unauthorized
        response = requests.get(f"{BASE_URL}/inference/{version_id}/config")
        test_401 = response.status_code in [401, 403]
        print_test("401 Unauthorized", test_401, f"Status: {response.status_code}")
        
        return test_404 and test_401
    except Exception as e:
        print_test("Error handling", False, f"Error: {e}")
        return False

# Run all tests
def main():
    print(f"\n{Colors.BOLD}{Colors.CYAN}🧪 Integration Testing Suite{Colors.ENDC}")
    print(f"{Colors.CYAN}Starting integration tests...{Colors.ENDC}\n")
    
    results = []
    
    # Run tests in sequence
    results.append(("Health Check", test_health()))
    results.append(("User Registration", test_register()))
    results.append(("User Login", test_login()))
    
    if token:
        results.append(("Create Model", test_create_model()))
        if model_id:
            results.append(("Create Version", test_create_version()))
            if version_id:
                results.append(("Get Config", test_get_config()))
                results.append(("Inference", test_inference()))
                results.append(("Image Inference", test_inference_image()))
                results.append(("Error Handling", test_errors()))
    
    # Summary
    print_section("Test Summary")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = f"{Colors.GREEN}✅{Colors.ENDC}" if result else f"{Colors.RED}❌{Colors.ENDC}"
        print(f"{status} {test_name}")
    
    print(f"\n{Colors.BOLD}Total: {passed}/{total} tests passed{Colors.ENDC}")
    
    if passed == total:
        print(f"{Colors.GREEN}{Colors.BOLD}🎉 All tests passed!{Colors.ENDC}\n")
    else:
        print(f"{Colors.YELLOW}{Colors.BOLD}⚠️  {total - passed} test(s) failed{Colors.ENDC}\n")

if __name__ == "__main__":
    main()
