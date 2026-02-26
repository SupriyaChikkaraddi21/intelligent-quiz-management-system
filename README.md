# Intelligent Quiz Management System

A full-stack AI-powered quiz platform with role-based access control, classroom management, gamification, and analytics.

🔗 Live Demo: https://intelligent-quiz-management-system.vercel.app  
🔗 Backend API: https://intelligent-quiz-management-system.onrender.com  

---

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
