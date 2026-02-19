from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response

from analytics.services.classroom_analytics_service import ClassroomAnalyticsService



# ======================================================
# TEACHER CLASSROOM ANALYTICS
# ======================================================

class TeacherClassroomAnalyticsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            data = ClassroomAnalyticsService.get_classroom_analytics(
                user=request.user,
                classroom_id=pk
            )
            return Response(data)

        except PermissionError as e:
            return Response({"error": str(e)}, status=403)
