# accounts/urls.py

from django.urls import path
from .views import (
register_view,
login_view,
google_login_view,
AccountViewSet,
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

# ✅ bind ViewSet correctly

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

# =========================
# CLASSROOM SYSTEM
# =========================

path("classroom/create/", CreateClassroomView.as_view(), name="create-classroom"),
path("classroom/join/", JoinClassroomView.as_view(), name="join-classroom"),
path("classroom/my/", MyClassroomsView.as_view(), name="my-classrooms"),
path("classroom/<int:pk>/", ClassroomDetailView.as_view(), name="classroom-detail"),
path("classroom/<int:pk>/leave/", LeaveClassroomView.as_view(), name="leave-classroom"),

path("classroom/quizzes/", TeacherQuizzesView.as_view(), name="teacher-quizzes"),
path("classroom/assign/", AssignQuizView.as_view(), name="assign-quiz"),

path(
    "classroom/<int:pk>/assignments/",
    ClassroomAssignmentsView.as_view(),
    name="classroom-assignments"
),

path(
    "classroom/student-assignments/",
    StudentAssignmentsView.as_view(),
    name="student-assignments"
),

]
