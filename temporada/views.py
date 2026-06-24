from rest_framework import viewsets
from core.permissions import IsAdminOrReadOnly
from .models import Temporada
from .serializers import TemporadaSerializer


class TemporadaViewSet(viewsets.ModelViewSet):
    queryset = Temporada.objects.all()
    serializer_class = TemporadaSerializer
    permission_classes = [IsAdminOrReadOnly]
