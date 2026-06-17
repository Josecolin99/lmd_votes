from rest_framework import viewsets
from core.permissions import IsAdminOrReadOnly
from .models import Chapter
from .serializers import ChapterSerializer


class ChapterViewSet(viewsets.ModelViewSet):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer
    permission_classes = [IsAdminOrReadOnly]
