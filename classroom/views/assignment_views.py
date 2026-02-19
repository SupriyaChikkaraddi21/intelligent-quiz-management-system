from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from accounts.models import Classroom
from ..models import QuizAssignment
from classroom.serializers import QuizAssignmentSerializer

from classroom.services.assignment_service import AssignmentService



# ======================================================
# ASSIGN QUIZ (Teacher)
# ======================================================

class AssignQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            data = AssignmentService.assign_quiz(
                user=request.user,
                classroom_id=request.data.get("classroom_id"),
                quiz_id=request.data.get("quiz_id"),
            )
            return Response(data, status=201)

        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        except PermissionError as e:
            return Response({"error": str(e)}, status=403)


# ======================================================
# CLASSROOM ASSIGNMENTS (Teacher View)
# ======================================================

class ClassroomAssignmentsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, classroom_id):
        classroom = get_object_or_404(Classroom, id=classroom_id)

        assignments = classroom.assignments.filter(is_active=True)

        serializer = QuizAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)


# ======================================================
# STUDENT: VIEW ASSIGNED QUIZZES
# ======================================================

class MyAssignedQuizzesView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        classrooms = Classroom.objects.filter(
            students=request.user
        )

        assignments = QuizAssignment.objects.filter(
            classroom__in=classrooms
        ).select_related("quiz", "classroom")

        data = [
            {
                "assignment_id": a.id,
                "quiz_id": a.quiz.id,
                "quiz_title": a.quiz.title,
                "classroom_id": a.classroom.id,
                "classroom_name": a.classroom.name,
                "assigned_at": a.assigned_at,
            }
            for a in assignments
        ]

        return Response(data)
