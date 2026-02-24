# accounts/views.py

from django.contrib.auth import authenticate, get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from django.db import models
import os
import random
import string

from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import viewsets, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.views import APIView

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from quiz.models import Quiz
from classroom.models import QuizAssignment




from .models import UserProfile, Classroom
from .serializers import (
    UserProfileSerializer,
    ProfileUpdateSerializer,
)

User = get_user_model()

# ==============================================================
# REGISTER (EMAIL VERIFICATION ENABLED)
# ==============================================================

from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    name = request.data.get("name")
    email = request.data.get("email")
    password = request.data.get("password")
    role = request.data.get("role", "student")

    if not name or not email or not password:
        return Response({"error": "All fields are required"}, status=400)

    if role not in ["student", "teacher"]:
        return Response({"error": "Invalid role"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    # 🔥 CREATE USER AS INACTIVE
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=name,
        is_active=False
    )

    profile = user.userprofile
    profile.role = role
    profile.save()

    # 🔥 GENERATE VERIFICATION TOKEN
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    verification_link = f"http://localhost:8000/api/v1/accounts/verify/{uid}/{token}/"
    # 🔥 SEND EMAIL
    send_mail(
        subject="Verify your Quiz Account",
        message=f"Click the link to verify your account:\n\n{verification_link}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )

    return Response({
        "success": True,
        "message": "Account created. Please verify your email."
    }, status=201)

# ==============================================================
# LOGIN
# ==============================================================

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"error": "Email and password required"}, status=400)

    user = User.objects.filter(username=email).first()

    if not user:
        return Response({"error": "Invalid credentials"}, status=401)

    if not user.check_password(password):
        return Response({"error": "Invalid credentials"}, status=401)

    if not user.is_active:
        return Response({"error": "Please verify your email first"}, status=403)

    token, _ = Token.objects.get_or_create(user=user)

    return Response({"success": True, "token": token.key})

# ==============================================================
# GOOGLE LOGIN
# ==============================================================

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def google_login_view(request):
    google_token = request.data.get("credential")
    CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

    if not google_token or not CLIENT_ID:
        return Response({"error": "Invalid request"}, status=400)

    try:
        info = id_token.verify_oauth2_token(
            google_token,
            google_requests.Request(),
            CLIENT_ID
        )

        email = info.get("email")
        name = info.get("name", "")

        user, created = User.objects.get_or_create(
            username=email,
            defaults={
                "email": email,
                "first_name": name,
                "is_active": True
            }
        )

        if created:
            user.set_unusable_password()
            user.save()
            UserProfile.objects.get_or_create(user=user)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({"success": True, "token": token.key})

    except Exception:
        return Response({"error": "Google login failed"}, status=401)


# ==============================================================
# PROFILE VIEWSET
# ==============================================================

@method_decorator(csrf_exempt, name="dispatch")
class AccountViewSet(viewsets.ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def create(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = ProfileUpdateSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({"success": True})

        return Response(serializer.errors, status=400)

    @action(detail=False, methods=["POST"])
    def avatar(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        file = request.FILES.get("avatar")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        profile.avatar = file
        profile.save()

        return Response({
            "success": True,
            "avatar_url": request.build_absolute_uri(profile.avatar.url)
        })


# ==============================================================
# CLASSROOM UTIL
# ==============================================================

def generate_class_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


# ==============================================================
# CREATE CLASSROOM (Teacher Only)
# ==============================================================
class CreateClassroomView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = request.user.userprofile

        if profile.role != "teacher":
            return Response(
                {"error": "Only teachers can create classrooms"},
                status=403
            )

        name = request.data.get("name")
        description = request.data.get("description", "")

        if not name:
            return Response({"error": "Classroom name required"}, status=400)

        # Generate unique 6-character code
        code = generate_class_code()

        # Ensure uniqueness
        while Classroom.objects.filter(code=code).exists():
            code = generate_class_code()

        classroom = Classroom.objects.create(
            name=name,
            description=description,
            teacher=request.user,
            code=code
        )

        return Response({
            "id": classroom.id,
            "name": classroom.name,
            "code": classroom.code
        })


# ==============================================================
# JOIN CLASSROOM (By Code)
# ==============================================================
class JoinClassroomView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = request.user.userprofile

        if profile.role != "student":
            return Response({"error": "Only students can join classrooms"}, status=403)

        code = request.data.get("code")

        if not code:
            return Response({"error": "Class code required"}, status=400)

        classroom = get_object_or_404(Classroom, code=code)

        if classroom.students.filter(id=request.user.id).exists():
            return Response({"message": "Already joined"})

        classroom.students.add(request.user)

        return Response({"message": "Joined successfully"})

# ==============================================================
# MY CLASSROOMS
# ==============================================================

class MyClassroomsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.userprofile

        if profile.role == "teacher":
            classrooms = Classroom.objects.filter(teacher=request.user)
        else:
            classrooms = Classroom.objects.filter(students=request.user)

        data = [
            {
                "id": c.id,
                "name": c.name,
                "description": c.description,
                "code": c.code,
                "student_count": c.students.count(),
            }
            for c in classrooms
        ]

        return Response(data)


# ==============================================================
# CLASSROOM DETAIL (Teacher View)
# ==============================================================
class ClassroomDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        classroom = get_object_or_404(Classroom, id=pk)

        # Teacher view
        if classroom.teacher == request.user:
            students = classroom.students.all()

            return Response({
                "id": classroom.id,
                "name": classroom.name,
                "code": classroom.code,
                "role": "teacher",
                "students": [
                    {
                        "id": s.id,
                        "username": s.username
                    }
                    for s in students
                ]
            })

        # Student view
        if request.user in classroom.students.all():
            return Response({
                "id": classroom.id,
                "name": classroom.name,
                "role": "student"
            })

        return Response({"error": "Forbidden"}, status=403)


# ==============================================================
# LEAVE CLASSROOM
# ==============================================================

class LeaveClassroomView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        classroom = get_object_or_404(Classroom, id=pk)
        classroom.students.remove(request.user)
        return Response({"message": "Left classroom"})

        return Response({"message": "Quiz assigned successfully"})
class ClassroomAssignmentsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        classroom = get_object_or_404(Classroom, id=pk)

        # Access control
        if (
            classroom.teacher != request.user and
            request.user not in classroom.students.all()
        ):
            return Response({"error": "Forbidden"}, status=403)

        assignments = classroom.assignments.select_related("quiz")

        data = [
            {
                "id": a.quiz.id,
                "title": a.quiz.title,
                "created_by": a.quiz.created_by.username,
                "assigned_at": a.assigned_at
            }
            for a in assignments
        ]

        return Response(data)
class TeacherQuizzesView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.userprofile.role != "teacher":
            return Response({"error": "Forbidden"}, status=403)

        quizzes = Quiz.objects.filter(created_by=request.user)

        data = [{"id": q.id, "title": q.title} for q in quizzes]

        return Response(data)
class AssignQuizView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        classroom_id = request.data.get("classroom_id")
        quiz_id = request.data.get("quiz_id")

        classroom = get_object_or_404(Classroom, id=classroom_id)

        if classroom.teacher != request.user:
            return Response({"error": "Forbidden"}, status=403)

        quiz = get_object_or_404(Quiz, id=quiz_id)

        QuizAssignment.objects.create(
            classroom=classroom,
            quiz=quiz,
            assigned_by=request.user
        )

        return Response({"success": True})

class StudentAssignmentsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        classrooms = request.user.joined_classrooms.all()

        assignments = QuizAssignment.objects.filter(
            classroom__in=classrooms
        ).select_related("quiz")

        data = [
            {
                "id": a.id,
                "quiz_id": a.quiz.id,
                "quiz_title": a.quiz.title,
                "classroom": a.classroom.name,
            }
            for a in assignments
        ]

        return Response(data)
# ==============================================================
# VERIFY EMAIL
# ==============================================================

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"error": "Invalid link"}, status=400)

        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            from django.shortcuts import redirect
            return redirect("http://localhost:5173/login?verified=true")
        else:
            return redirect("http://localhost:5173/login?verified=false")