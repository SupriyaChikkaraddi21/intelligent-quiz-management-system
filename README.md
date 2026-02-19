🚀 Intelligent Quiz Management System

AI-powered quiz generation platform with classroom management, analytics, and gamification.


🔥 Features

AI-generated quizzes
Challenge & Practice modes
Classroom system (Teacher & Student roles)
Leaderboard & gamification
Email verification system
Google OAuth login
Analytics tracking
PostgreSQL database


🏗 Tech Stack

Backend:
Django
Django REST Framework
PostgreSQL

Frontend:
React (Vite)
TailwindCSS

Authentication:
Token Authentication
Google OAuth

Email Verification (SMTP)
⚙️ Setup Instructions
1️⃣ Clone repo
git clone <https://github.com/SupriyaChikkaraddi21/intelligent-quiz-management-system.git>
cd intelligent-quiz-management-system
Axios

Recharts

📦 Installation & Setup
🔧 Backend Setup (Django)
1. Clone the repo
git clone https://github.com/SupriyaChikkaraddi21/intelligent-quiz-management-system.git
cd quizgen

2. Create Virtual Environment
python -m venv .venv


2️⃣ Create virtual environment
python -m venv venv
venv\Scripts\activate

3️⃣ Install dependencies
pip install -r requirements.txt

4️⃣ Configure environment
cp .env.example .env
Fill credentials.

5️⃣ Run migrations
python manage.py migrate

6️⃣ Start backend
python manage.py runserver

7️⃣ Start frontend
cd quiz-frontend
npm install
npm run dev

