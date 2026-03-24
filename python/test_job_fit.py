import requests
import json

url = "http://localhost:8000/api/ai/analyze-job-fit"
payload = {
    "studentProfile": {
        "skills": ["react", "node.js", "javascript", "mongodb", "express"],
        "bio": "Passionate full-stack developer",
        "cgpa": 8.5
    },
    "job": {
        "title": "MERN Stack Developer",
        "description": "Looking for a full-stack engineer with 1-3 years experience in React, Node, Express, and MongoDB. Must have good understanding of REST APIs.",
        "requirements": {
            "skillsRequired": ["React", "Node.js", "MongoDB", "Express", "REST APIs"]
        }
    }
}

try:
    response = requests.post(url, json=payload)
    print("Status Code:", response.status_code)
    print("Response payload:", json.dumps(response.json(), indent=2))
except Exception as e:
    print("Error:", e)
