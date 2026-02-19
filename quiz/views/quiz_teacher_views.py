from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response

from ..models import Quiz

from analytics.services.quiz_analytics_service import QuizAnalyticsService

class QuizTeacherViewSet(viewsets.GenericViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Quiz.objects.all()
    lookup_field = "id"
    lookup_url_kwarg = "pk"

    @action(detail=True, methods=["get"])
    def teacher_stats(self, request, pk=None):
        quiz = self.get_object()

        try:
            data = QuizAnalyticsService.get_teacher_stats(
                quiz=quiz,
                user=request.user
                )
            return Response(data)

        except PermissionError as e:
            return Response({"error": str(e)}, status=403)