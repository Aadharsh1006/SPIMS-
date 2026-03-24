# SPIMS+ (Standardized Placement & Internship Management System)

SPIMS+ is a comprehensive, AI-powered career and placement portal designed to streamline the recruitment process for students, recruiters, and Training & Placement Officers (TPO).

## 🚀 Key Features

- **Multi-Role Authentication**: Secure login for Students, Faculty, TPOs, Recruiters, and Alumni.
- **AI-Driven Path Prediction**: Personalized career guidance based on student profiles.
- **Automated Resume Parsing**: High-precision ATS scoring and feedback using AI models.
- **Job Matching & Analytics**: Real-time placement tracking and skill-gap analysis for educational institutions.
- **Secure Messaging**: Integrated communication channel between all stakeholders.
- **Global Theme Support**: Modern, high-performance UI with full Dark/Light mode.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Recharts.
- **Backend (Node.js)**: Express, MongoDB (Mongoose), Nodemailer, JWT.
- **AI Microservice (Python)**: Groq (Llama 3), HuggingFace Transformers, FastAPI.

## 📂 Project Structure

- `/frontend`: React application (Client-side UI).
- `/backend`: Node.js server (Auth, Core Logic, DB Access).
- `/python`: AI Microservice (LLM Integration, Resume Analysis).

## ⚙️ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB (Local or Atlas)

### 2. Environment Setup
Create a `.env` file in `frontend/`, `backend/`, and `python/` based on the provided `.env.example` templates.

### 3. Installation
```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install

# AI Service
cd python && pip install -r requirements.txt
```

### 4. Running the Project
```bash
# Start Backend (Port 5000)
cd backend && npm run dev

# Start Frontend (Port 5173)
cd frontend && npm run dev

# Start AI Service (Port 8000)
cd python && python server.py
```

## 🔒 Security Note
This project uses a `.gitignore` to protect sensitive credentials. **Never** upload your `.env` files or Firebase service account keys to GitHub. Refer to `.env.example` for the required configuration.
