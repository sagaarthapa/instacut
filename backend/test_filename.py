import requests
import json

# Test the backend API directly
def test_filename_generation():
    print("=== Testing filename generation directly ===")
    
    # Create a simple test image file
    with open("test.jpg", "wb") as f:
        # Small JPEG
        f.write(bytes.fromhex("ffd8ffe000104a46494600010101006000600000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffdb0043010909090c0b0c180d0d1832211c213232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232ffc00011080001000103012200021101031101ffc4001500010100000000000000000000000000000008ffc40014100100000000000000000000000000000000ffda000c03010002000311003f00bf800fffd9"))
    
    try:
        # Test file upload and processing
        url = "http://localhost:8000/api/v1/process"
        
        with open("test.jpg", "rb") as f:
            files = {"file": ("test.jpg", f, "image/jpeg")}
            data = {
                "operation": "background_removal",
                "model": "rembg",
                "options": "{}"
            }
            
            print("Sending request...")
            response = requests.post(url, files=files, data=data)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("Response:")
                print(json.dumps(result, indent=2))
                
                # Check what filename was generated
                if 'result' in result and 'output_filename' in result['result']:
                    filename = result['result']['output_filename']
                    print(f"\nGenerated filename: {filename}")
                    print(f"Ends with .png: {filename.endswith('.png')}")
                    print(f"Ends with .jpg: {filename.endswith('.jpg')}")
                else:
                    print("No output_filename found in result")
            else:
                print("Error response:")
                print(response.text)
                
    except Exception as e:
        print(f"Error: {e}")
    
    # Clean up
    try:
        import os
        os.remove("test.jpg")
    except:
        pass

if __name__ == "__main__":
    test_filename_generation()