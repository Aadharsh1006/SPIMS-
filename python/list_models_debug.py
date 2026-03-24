
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get('GEMINI_API_KEY')

print(f"DEBUG: API Key exists: {bool(api_key)}")

client = genai.Client(api_key=api_key)

print("Listing available models...")
try:
    models = client.models.list()
    # print raw models
    for m in models:
        print(f"- {m.name}")
except Exception as e:
    print(f"Error: {e}")
