from rest_framework import viewsets
from core.permissions import IsAdminOrReadOnly
from .models import Chapter
from .serializers import ChapterSerializer


class ChapterViewSet(viewsets.ModelViewSet):
    serializer_class   = ChapterSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = Chapter.objects.all()
        t = self.request.query_params.get('temporada')
        if t:
            qs = qs.filter(temporada_id=t)
        return qs
