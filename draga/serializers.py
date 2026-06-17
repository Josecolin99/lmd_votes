from rest_framework import serializers
from .models import Draga


class DragaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Draga
        fields = ['id', 'name', 'image_url', 'created_at']
