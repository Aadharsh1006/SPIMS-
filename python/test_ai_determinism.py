
import requests
import json
import hashlib

def test_determinism():
    url = "http://localhost:8000/parse"
    resume_text = """
    Aadhaar's Resume
    Email: aadhaar@example.com
    GitHub: https://github.com/aadhaar
    
    Professional Summary
    Experienced software engineer with a focus on AI and full-stack development. 
    Passionate about building scalable systems and intelligent interfaces.
    
    Projects
    • SPIMS+ Management System
      Built a university placement management system using React, Node.js, and MongoDB.
      Implemented AI-powered resume parsing and job matching.
    
    • AI Chatbot
      Developed a conversational AI using Gemini API for student assistance.
    """
    
    data = {"text": resume_text}
    outputs = []
    
    print("Starting determinism test (5 iterations)...")
    for i in range(5):
        try:
            response = requests.post(url, json=data)
            if response.status_code == 200:
                res_data = response.json()
                print(f"Iteration {i+1}: Source = {res_data.get('extractionMethod')}")
                # Remove extractionMethod and atsScore as they might contain metadata
                res_data.pop('extractionMethod', None)
                res_data.pop('atsScore', None)
                
                # Sort keys and dump to string for consistent hashing
                dump = json.dumps(res_data, sort_keys=True)
                h = hashlib.md5(dump.encode()).hexdigest()
                outputs.append(h)
                print(f"Iteration {i+1}: Hash = {h}")
            else:
                print(f"Iteration {i+1}: Failed with status {response.status_code}")
        except Exception as e:
            print(f"Iteration {i+1}: Error - {e}")
            break
            
    if len(set(outputs)) == 1 and len(outputs) == 5:
        print("\nSUCCESS: Output is 100% deterministic.")
    else:
        print(f"\nFAILURE: Detected {len(set(outputs))} unique outputs across 5 runs.")

if __name__ == "__main__":
    test_determinism()
