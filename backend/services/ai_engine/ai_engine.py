import sys
import json
import os
import argparse
from pdfminer.high_level import extract_text
import re

# Lazy load heavy libraries to speed up simple checks if needed
# But for a persistent service or CLI, import at top is fine.
# For "spawn per request", imports are slow. Ideally this should be a Flask/FastAPI microservice.
# Given constraints "Node.js Backend", spawning a process is simplest but slow. 
# We will use a script that takes arguments.

def parse_resume(file_path):
    try:
        text = extract_text(file_path)
        
        # Basic Email Extraction
        email = re.findall(r'\S+@\S+', text)
        email = email[0] if email else None

        # Basic Phone Extraction (Simple regex, can be improved)
        phone = re.findall(r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]', text)
        phone = phone[0] if phone else None

        # Skill Extraction (Simple keyword matching for MVP)
        # In production, use a trained spaCy NER model
        known_skills = [
            "python", "java", "javascript", "react", "node.js", "mongodb", "sql", "aws", "docker", 
            "kubernetes", "machine learning", "ai", "html", "css", "c++", "c#", "git"
        ]
        
        found_skills = []
        text_lower = text.lower()
        for skill in known_skills:
            if skill in text_lower:
                found_skills.append(skill)
        
        # Return JSON
        result = {
            "email": email,
            "phone": phone,
            "skills": list(set(found_skills)),
            "text_content": text[:1000] # Preview
        }
        return result
    except Exception as e:
        return {"error": str(e)}

def generate_embedding(text):
    try:
        from sentence_transformers import SentenceTransformer
        # Suppress warnings
        os.environ["TOKENIZERS_PARALLELISM"] = "false"
        model = SentenceTransformer('all-MiniLM-L6-v2')
        embedding = model.encode(text).tolist()
        return {"embedding": embedding}
    except Exception as e:
        return {"error": str(e)}


def calculate_ats_score(resume_text, job_description, job_skills=[]):
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity

    if not resume_text or not job_description:
        return 0, {"matchPercentage": 0, "matchedSkills": [], "missingSkills": [], "reasoning": "Missing inputs"}

    # Clean text
    resume_text = clean_text(resume_text)
    job_description = clean_text(job_description)
    
    # 1. Cosine Similarity (Content Match)
    tfidf = TfidfVectorizer(stop_words='english')
    try:
        tfidf_matrix = tfidf.fit_transform([resume_text, job_description])
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    except ValueError:
        return 0, {"matchPercentage": 0, "matchedSkills": [], "missingSkills": [], "reasoning": "Not enough text data"}

    # 2. Skill Matching (Keyword based)
    # Normalize texts
    resume_lower = resume_text.lower()
    
    # If job_skills provided, use them. Else, basic extraction (naive).
    # For better results, we should perform entity extraction, but for MVP we rely on provided job_skills.
    # If job_skills is a string representation of list, parse it.
    target_skills = job_skills if isinstance(job_skills, list) else []
    
    matched_skills = []
    missing_skills = []

    for skill in target_skills:
        # Simple substring match - basic but fast
        if skill.lower() in resume_lower:
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    skill_match_ratio = len(matched_skills) / len(target_skills) if target_skills else 0
    
    # Weighted Score: 60% Content Similarity + 40% Skill Match
    # If no skills provided, 100% Content Similarity
    if target_skills:
        final_score = (cosine_sim * 60) + (skill_match_ratio * 40)
    else:
        final_score = cosine_sim * 100

    final_score = round(final_score, 2)
    match_percentage = int(final_score)

    reasoning = f"Content similarity is {int(cosine_sim*100)}%. "
    if target_skills:
        reasoning += f"Matched {len(matched_skills)} out of {len(target_skills)} required skills."
    else:
        reasoning += "Skills match not calculated (no skills provided)."

    explanation = {
        "matchPercentage": match_percentage,
        "matchedSkills": matched_skills,
        "missingSkills": missing_skills,
        "reasoning": reasoning
    }

    return match_percentage, explanation

def generate_chatbot_response(prompt, context=""):
    try:
        import requests
        # Ollama API Endpoint (Local)
        url = "http://localhost:11434/api/generate"
        
        system_prompt = "You are a helpful assistant for the SPIMS+ Placement Portal. Answer concisely."
        full_prompt = f"{system_prompt}\nContext: {context}\nUser: {prompt}\nAssistant:"
        
        payload = {
            "model": "mistral", # or "llama3"
            "prompt": full_prompt,
            "stream": False
        }
        
        response = requests.post(url, json=payload, timeout=5)
        if response.status_code == 200:
            return response.json().get('response', 'I am unable to think right now.')
        else:
            return "Local LLM is offline or busy."
    except Exception:
        return "Local LLM unreachable. Using rule-based fallback."

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    return text

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('command', choices=['parse_resume', 'embed_text', 'match_ats', 'chatbot'])
    parser.add_argument('--text', help="Text to embed or Resume file path for parsing")
    parser.add_argument('--job_desc', help="Job Description text")
    parser.add_argument('--job_skills', help="Job Skills (comma separated)", default="")
    
    # Read from stdin if arguments not provided (for larger texts)
    args, unknown = parser.parse_known_args()
    
    command = args.command
    
    if not command:
        try:
            # Check if stdin has data
            if not sys.stdin.isatty():
                input_data = json.load(sys.stdin)
                command = input_data.get('command')
                text = input_data.get('text', '')
                job_desc = input_data.get('job_desc', '')
                job_skills = input_data.get('job_skills', [])
            else:
                 print(json.dumps({"error": "No command provided"}))
                 sys.exit(1)
        except Exception as e:
             sys.exit(1)
    else:
        text = args.text
        job_desc = args.job_desc
        job_skills = args.job_skills.split(',') if args.job_skills else []

    if command == 'parse_resume':
        if text:
            print(json.dumps(parse_resume(text)))
        else:
            print(json.dumps({"error": "No file path provided"}))
            
    elif command == 'embed_text':
        if text:
            vector = generate_embedding(text)
            print(json.dumps(vector))
        else:
            print(json.dumps({"error": "No text provided"}))
            
    elif command == 'match_ats':
        if text and job_desc:
            score, explanation = calculate_ats_score(text, job_desc, job_skills)
            print(json.dumps({
                "score": score,
                "explanation": explanation
            }))
        else:
             print(json.dumps({"error": "Missing resume or job description"}))
             
    elif command == 'chatbot':
        prompt = text # reusing text arg for prompt
        context = job_desc # reusing job_desc arg for context
        response = generate_chatbot_response(prompt, context)
        print(json.dumps({"response": response}))
        
    else:
        print(json.dumps({"error": "Unknown command"}))
