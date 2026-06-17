from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Calificacion
from .serializers import CalificacionSerializer


class CalificacionViewSet(viewsets.ModelViewSet):
    serializer_class = CalificacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Calificacion.objects.filter(user=self.request.user)
        chapter_id = self.request.query_params.get('chapter')
        if chapter_id:
            qs = qs.filter(chapter_id=chapter_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
