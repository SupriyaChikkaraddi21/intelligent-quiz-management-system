# Intelligent Quiz Management System

A full-stack AI-powered quiz platform with role-based access control, classroom management, gamification, and analytics.

🔗 Live Demo: https://intelligent-quiz-management-system.vercel.app  
🔗 Backend API: https://intelligent-quiz-management-system.onrender.com  

---
## 📸 Screenshots

### 🏠 Landing Page
![Landing Page](./screenshots/landing.png)

### 📊 Dashboard
![Dashboard](./screenshots/dashboard.png)

### 🧠 Create Quiz (AI Powered)
![Create Quiz](./screenshots/createquiz.png)

### 🏫 Classroom Management
![Classroom](./screenshots/classroom.png)

### 📈 Analytics
![Analytics](./screenshots/analytics.png)

### 📉 Progress Tracking
![Progress](./screenshots/progress.png)

### 🔐 Authentication (Register/Login)
![Register](./screenshots/register.png)

## 🚀 Features

### 🔐 Authentication
- Email & Password Registration
- Google OAuth Login
- Token-based Authentication (DRF)
- Role-based Access (Student / Teacher)

### 👨‍🎓 Student Features
- Take AI-generated quizzes
- View quiz history
- Track performance analytics
- Earn reward points
- Join classrooms using code

### 👩‍🏫 Teacher Features
- Create and manage quizzes
- Manage classrooms
- Assign quizzes
- Track student activity

### 📊 Analytics
- Performance dashboard
- Difficulty recommendation
- Progress tracking

### 🎮 Gamification
- Reward points system
- Unlockable modes
- Daily streak tracking

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Axios
- Google OAuth

### Backend
- Django
- Django REST Framework
- Token Authentication
- PostgreSQL
- Google OAuth Verification

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: PostgreSQL (Render)

---

## 🏗 Architecture Overview

Frontend (React)  
⬇  
REST API (Django DRF)  
⬇  
PostgreSQL Database  

Authentication Flow:
1. User logs in
2. Token generated
3. Token stored in frontend
4. All API requests use token

---

## 📂 Project Structure

Backend:
- accounts/ → Authentication & Roles
- quiz/ → Quiz logic & attempts
- classroom/ → Classroom management
- gamification/ → Rewards system
- leaderboard/ → Ranking system

Frontend:
- pages/ → UI pages
- api/ → Axios configuration
- components/ → Reusable UI components

---

## ⚙️ Installation (Local Setup)

### Backend

```bash
git clone <repo-url>
cd intelligent-quiz-management-system
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
### Frohntend

```bash
cd quiz-frontend
npm install
npm run dev
```
## 🔐 Environment Variables

Create a `.env` file in the backend root directory and configure:

### Django Core
DJANGO_SECRET_KEY=your-secret-key  
DJANGO_DEBUG=False  
DJANGO_ALLOWED_HOSTS=your-domain.com,localhost,127.0.0.1  

### Database (PostgreSQL)
POSTGRES_DB=intelligent_quiz  
POSTGRES_USER=postgres  
POSTGRES_PASSWORD=your-db-password  
POSTGRES_HOST=localhost  
POSTGRES_PORT=5432  

### Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com  
EMAIL_PORT=587  
EMAIL_USE_TLS=True  
EMAIL_HOST_USER=your-email@gmail.com  
EMAIL_HOST_PASSWORD=your-16-char-app-password  

### AI API
GROQ_API_KEY=your-groq-api-key  

### Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id  
GOOGLE_CLIENT_SECRET=your-google-client-secret

📌 Future Improvements

Email verification
AI performance tuning
Admin dashboard improvements

👩‍💻 Author

Supriya Chikkaraddi
Computer Science Engineering Student

© 2026 Supriya Chikkaraddi. All rights reserved.
This project is for educational and portfolio purposes.





