import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
try:
    client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))
    models = client.models.list()
    for m in models:
        print(m.name)
except Exception as e:
    print(f"Error: {e}")
