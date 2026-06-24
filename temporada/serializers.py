from rest_framework import serializers
from .models import Temporada


class TemporadaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Temporada
        fields = ['id', 'number', 'name', 'image_url']
