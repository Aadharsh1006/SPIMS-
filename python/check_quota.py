import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

key = os.environ.get('GEMINI_API_KEY')
print("\n" + "="*40)
print("GEMINI API QUOTA DIAGNOSTIC")
print("="*40)

if not key:
    print("STATUS: ERROR")
    print("REASON: No GEMINI_API_KEY found in python/.env")
    exit()

genai.configure(api_key=key)

print("\nLISTING ACCESSIBLE MODELS:")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"  - {m.name} (Ready)")
except Exception as e:
    print(f"  Failed to list models: {e}")

models_to_test = [
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-2.5-flash',
    'gemini-pro-latest'
]

for model_name in models_to_test:
    # Use full path for models
    full_path = f"models/{model_name}" if not model_name.startswith("models/") else model_name
    print(f"\nTESTING MODEL: {full_path}...")
    try:
        model = genai.GenerativeModel(full_path)
        response = model.generate_content("Hi", generation_config={"max_output_tokens": 10})
        print(f"  STATUS: [OK] HEALTHY")
        print(f"  SAMPLE: {response.text.strip()}")
    except Exception as e:
        error_msg = str(e)
        print(f"  STATUS: [ERROR] FAILED")
        if "429" in error_msg or "ResourceExhausted" in error_msg:
            print("  REASON: Quota Exceeded (429)")
        elif "404" in error_msg:
            print("  REASON: Model Not Found (404)")
        elif "API_KEY_INVALID" in error_msg:
            print("  REASON: Invalid API Key")
        else:
            print(f"  REASON: {error_msg}")

print("\n" + "="*40 + "\n")
