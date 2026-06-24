from django.db import models


class Draga(models.Model):
    temporada  = models.ForeignKey('temporada.Temporada', on_delete=models.CASCADE, related_name='dragas')
    name       = models.CharField(max_length=100)
    image_url  = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
