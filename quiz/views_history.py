# quiz/views_history.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response

from .models import QuizAttempt


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def quiz_history(request):
    attempts = (
        QuizAttempt.objects
        .filter(user=request.user, completed=True)
        .select_related("quiz")
        .order_by("-finished_at")
    )

    data = []
    for attempt in attempts:
        data.append({
            "attempt_id": str(attempt.id),
            "quiz_title": attempt.quiz.title if attempt.quiz else "Untitled Quiz",
            "score": attempt.score,
            "status": "Completed" if attempt.completed else "In Progress",
            "started_at": attempt.started_at,
            "finished_at": attempt.finished_at,
        })

    return Response(data)
