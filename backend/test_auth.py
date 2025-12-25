import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api/auth"

def test_register(email, password, name):
    print(f"Testing registration for {email}...")
    try:
        response = requests.post(f"{BASE_URL}/register", json={
            "email": email,
            "password": password,
            "name": name
        })
        if response.status_code == 200:
            print("Registration successful!")
            return True
        else:
            print(f"Registration failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_login(email, password):
    print(f"Testing login for {email}...")
    try:
        response = requests.post(f"{BASE_URL}/login", json={
            "email": email,
            "password": password
        })
        if response.status_code == 200:
            print("Login successful!")
            token = response.json().get("token")
            print(f"Token received: {token[:10]}...")
            return True
        else:
            print(f"Login failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    email = "testuser@example.com"
    password = "password123"
    name = "Test User"
    
    # Try to register
    if test_register(email, password, name):
        # Try to login
        test_login(email, password)
    else:
        # If registration failed (maybe already exists), try login
        test_login(email, password)
