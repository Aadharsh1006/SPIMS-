import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

key = os.environ.get('GEMINI_API_KEY')
print(f"Key: {key[:4]}...{key[-4:] if key else ''}")

if not key:
    print("No key found")
    exit()

genai.configure(api_key=key)
model = genai.GenerativeModel('gemini-2.0-flash')

try:
    print("Testing Gemini...")
    response = model.generate_content("Say 'Gemini is active'")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
