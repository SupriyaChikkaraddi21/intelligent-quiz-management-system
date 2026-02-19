# accounts/urls.py
from .views import AssignQuizView, ClassroomAssignmentsView

from django.urls import path
from .views import (
    register_view,
    login_view,
    google_login_view,
    AccountViewSet,

    # Classroom views
    CreateClassroomView,
    JoinClassroomView,
    MyClassroomsView,
    ClassroomDetailView,
    LeaveClassroomView,
    TeacherQuizzesView,
    AssignQuizView,
    ClassroomAssignmentsView,
    StudentAssignmentsView,
)

account = AccountViewSet.as_view

urlpatterns = [

    # =========================
    # AUTH
    # =========================
    path("register/", register_view, name="register"),
    path("login/", login_view, name="login"),
    path("google-login/", google_login_view, name="google-login"),

    # =========================
    # PROFILE
    # =========================
    path(
        "profile/",
        account({
            "get": "list",
            "post": "create",
        }),
        name="profile",
    ),

    path(
        "profile/avatar/",
        account({
            "post": "avatar",
        }),
        name="profile-avatar",
    ),

    # =====================================================
    # 🔥 CLASSROOM SYSTEM
    # =====================================================

    # Teacher creates classroom
    path(
        "classroom/create/",
        CreateClassroomView.as_view(),
        name="create-classroom"
    ),

    # Student joins classroom by CODE (not pk)
    path(
        "classroom/join/",
        JoinClassroomView.as_view(),
        name="join-classroom"
    ),

    # List my classrooms (teacher or student)
    path(
        "classroom/my/",
        MyClassroomsView.as_view(),
        name="my-classrooms"
    ),

    # Classroom detail (teacher only)
    path(
        "classroom/<int:pk>/",
        ClassroomDetailView.as_view(),
        name="classroom-detail"
    ),

    # Leave classroom (student)
    path(
        "classroom/<int:pk>/leave/",
        LeaveClassroomView.as_view(),
        name="leave-classroom"
    ),

    path(
        "classroom/<int:pk>/assign-quiz/",
         AssignQuizView.as_view()),
    path(
        "classroom/<int:pk>/assignments/",
         ClassroomAssignmentsView.as_view()
    ),
    path(
        "classroom/quizzes/", 
         TeacherQuizzesView.as_view()
    ),
    path(
        "classroom/assign/", 
         AssignQuizView.as_view()
    ),
    path(
        "classroom/<int:pk>/assignments/",
         ClassroomAssignmentsView.as_view()
    ),
    path(
        "classroom/student-assignments/",
        StudentAssignmentsView.as_view()
    ),

]
