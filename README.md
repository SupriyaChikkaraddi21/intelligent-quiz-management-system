🚀 QuizGen – Intelligent Quiz Management System

A full-stack AI-powered quiz platform built with:

Django + Django REST Framework (Backend)

React + Vite + Tailwind (Frontend)

OpenAI GPT-4o-mini (AI Quiz Generator)

MySQL Database

🧠 Overview

QuizGen is an intelligent quiz generator that creates MCQs using AI based on categories and difficulty levels.
Users can:

✔ Register and log in
✔ Generate quizzes using AI
✔ Attempt quizzes
✔ View score & results
✔ Check dashboard, progress, and leaderboard
✔ Update profile + upload avatar
✔ Work across React + Django seamlessly

🏗 Tech Stack
Backend

Django

Django REST Framework

Token Authentication

MySQL

OpenAI API

Frontend

React (Vite)

Tailwind CSS

Axios

Recharts

📦 Installation & Setup
🔧 Backend Setup (Django)
1. Clone the repo
git clone https://github.com/SupriyaChikkaraddi21/quizgen.git
cd quizgen

2. Create Virtual Environment
python -m venv .venv


Activate it:

Windows:

.venv\Scripts\activate

3. Install backend requirements
pip install -r requirements.txt

4. Create .env file

Create a file named .env in the root folder:

SECRET_KEY=your-django-key
OPENAI_API_KEY=your-openai-key
MYSQL_NAME=quizgen
MYSQL_USER=root
MYSQL_PASSWORD=12345
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306

5. Run migrations
python manage.py migrate

6. Start backend
python manage.py runserver


Backend runs on:
👉 http://127.0.0.1:8000/

🎨 Frontend Setup (React)
cd quiz-frontend
npm install
npm run dev


Frontend runs on:
👉 http://localhost:5173/

🔥 API Endpoints Summary
Endpoint	Method	Description
/api/accounts/register/	POST	Register user
/api/accounts/login/	POST	Login + Token
/api/accounts/profile/	GET	User profile
/api/quizzes/generate/	POST	Generate quiz using AI
/api/quizzes/{id}/start/	POST	Start quiz
/api/attempts/{id}/answer/	POST	Save answer
/api/attempts/{id}/finish/	POST	Finish quiz
/api/quizzes/dashboard/	GET	Dashboard data
/api/quizzes/progress/	GET	Progress graph
/api/quizzes/leaderboard/	GET	Leaderboard
🎯 Features

Fully functional Django backend

MySQL supported

AI-generated questions using GPT-4o-mini

Secure Token Login

Beautiful Tailwind UI

Progress tracking + analytics

Clean architecture for teamwork

👥 Collaborators

Add collaborators here once added in GitHub.

📌 License

This project is for educational & internship purposes.

💬 Contact

If you need help:
Supriya Chikkaraddi 