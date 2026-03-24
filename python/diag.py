
import google.generativeai as genai_legacy
from google import genai as genai_new
import os
from dotenv import load_dotenv

env_path = r'c:\Users\aadha\OneDrive\Desktop\SPIMS+\python\.env'
load_dotenv(dotenv_path=env_path)
api_key = os.environ.get('GEMINI_API_KEY', '').strip()

print(f"DEBUG: Key: {api_key[:8]}... Len: {len(api_key)}")

models_to_test = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-8b',
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.0-pro'
]

print("\n--- TESTING WITH LEGACY SDK ---")
genai_legacy.configure(api_key=api_key)
for m_name in models_to_test:
    name = f'models/{m_name}'
    print(f"Testing {name}...", end=' ', flush=True)
    try:
        model = genai_legacy.GenerativeModel(m_name)
        res = model.generate_content("Hi")
        print(f"SUCCESS: {res.text[:10]}...")
    except Exception as e:
        # Check if it's a 429
        if "429" in str(e):
             print(f"QUOTA EXHAUSTED (429)")
        else:
             print(f"FAILED: {str(e)[:50]}")

print("\n--- TESTING WITH NEW SDK ---")
client = genai_new.Client(api_key=api_key)
for m_name in models_to_test:
    name = f'models/{m_name}'
    print(f"Testing {name}...", end=' ', flush=True)
    try:
        res = client.models.generate_content(model=name, contents="Hi")
        print(f"SUCCESS: {res.text[:10]}...")
    except Exception as e:
         if "429" in str(e):
             print(f"QUOTA EXHAUSTED (429)")
         else:
             print(f"FAILED: {str(e)[:50]}")
