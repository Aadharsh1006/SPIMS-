
import requests
import json
import difflib

def compare_outputs():
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
    
    print("Fetching two samples for comparison...")
    r1 = requests.post(url, json=data).json()
    r2 = requests.post(url, json=data).json()
    
    r1.pop('extractionMethod', None)
    r1.pop('atsScore', None)
    r2.pop('extractionMethod', None)
    r2.pop('atsScore', None)
    
    s1 = json.dumps(r1, indent=2, sort_keys=True)
    s2 = json.dumps(r2, indent=2, sort_keys=True)
    
    if s1 == s2:
        print("Outputs are identical.")
    else:
        print("DIFFERENCE DETECTED:")
        diff = difflib.unified_diff(s1.splitlines(), s2.splitlines(), fromfile='sample1', tofile='sample2')
        for line in diff:
            print(line)

if __name__ == "__main__":
    compare_outputs()
