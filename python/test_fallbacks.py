
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get('GEMINI_API_KEY')
client = genai.Client(api_key=api_key)

for model_id in ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-lite']:
    print(f"Testing {model_id}...")
    try:
        response = client.models.generate_content(
            model=model_id,
            contents="hi"
        )
        print(f"SUCCESS with {model_id}")
        break
    except Exception as e:
        print(f"FAILED with {model_id}: {e}")
