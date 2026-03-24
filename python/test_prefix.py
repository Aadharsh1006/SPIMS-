
from google import genai
import os
from dotenv import load_dotenv

env_path = r'c:\Users\aadha\OneDrive\Desktop\SPIMS+\python\.env'
load_dotenv(dotenv_path=env_path)
api_key = os.environ.get('GEMINI_API_KEY', '').strip()

client = genai.Client(api_key=api_key)

candidates = [
    'gemini-1.5-flash',
    'models/gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'models/gemini-1.5-flash-latest',
    'gemini-2.0-flash',
    'models/gemini-2.0-flash'
]

for m in candidates:
    print(f"Testing '{m}'...", end=' ', flush=True)
    try:
        res = client.models.generate_content(model=m, contents="Hi")
        print(f"SUCCESS: {res.text[:10]}...")
    except Exception as e:
        if "429" in str(e):
            print("ERROR: 429 QUOTA EXHAUSTED")
        elif "404" in str(e):
            print("ERROR: 404 NOT FOUND")
        else:
            print(f"ERROR: {str(e)[:50]}")
