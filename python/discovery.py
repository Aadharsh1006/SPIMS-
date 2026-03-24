
import google.generativeai as genai
import os
from dotenv import load_dotenv

env_path = r'c:\Users\aadha\OneDrive\Desktop\SPIMS+\python\.env'
load_dotenv(dotenv_path=env_path)
api_key = os.environ.get('GEMINI_API_KEY', '').strip()

genai.configure(api_key=api_key)

print(f"DEBUG: Key: {api_key[:8]}... Len: {len(api_key)}")

print("Discovering all models...")
try:
    for m in genai.list_models():
        print(f"FOUND: {m.name} | Methods: {m.supported_generation_methods}")
        # Test if it can generate content
        if 'generateContent' in m.supported_generation_methods:
            try:
                model = genai.GenerativeModel(m.name)
                res = model.generate_content("Hi", request_options={"timeout": 10})
                print(f"  --> SUCCESS: {res.text[:10]}...")
            except Exception as e:
                print(f"  --> FAILED: {str(e)[:50]}")
except Exception as e:
    print(f"LIST FAILED: {e}")
