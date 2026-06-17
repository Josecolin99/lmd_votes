from rest_framework import serializers
from .models import Calificacion
from draga.serializers import DragaSerializer


class CalificacionSerializer(serializers.ModelSerializer):
    draga_detail = DragaSerializer(source='draga', read_only=True)

    class Meta:
        model = Calificacion
        fields = ['id', 'draga', 'draga_detail', 'chapter', 'score', 'extended']
