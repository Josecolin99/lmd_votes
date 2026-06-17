from rest_framework import viewsets
from core.permissions import IsAdminOrReadOnly
from .models import Draga
from .serializers import DragaSerializer


class DragaViewSet(viewsets.ModelViewSet):
    queryset = Draga.objects.all().order_by('name')
    serializer_class = DragaSerializer
    permission_classes = [IsAdminOrReadOnly]
