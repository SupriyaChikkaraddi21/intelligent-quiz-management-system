from django.urls import path
from classroom.views.assignment_views import (
    AssignQuizView,
    MyAssignedQuizzesView,
    ClassroomAssignmentsView,
)

from classroom.views.classroom_analytics_views import TeacherClassroomAnalyticsView


urlpatterns = [
    path("quiz/assign/", AssignQuizView.as_view(), name="assign-quiz"),
    path("quiz/assigned/", MyAssignedQuizzesView.as_view(), name="my-assigned-quizzes"),
    path(
        "quiz/classroom/<int:classroom_id>/assignments/",
        ClassroomAssignmentsView.as_view(),
        name="classroom-assignments",
    ),
    path(
    "quiz/classroom/<int:pk>/analytics/",
    TeacherClassroomAnalyticsView.as_view(),
    name="classroom-analytics",
    ),

]
