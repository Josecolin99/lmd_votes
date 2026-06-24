from django.db import models


class Temporada(models.Model):
    number    = models.PositiveSmallIntegerField(unique=True)
    name      = models.CharField(max_length=100, blank=True)
    image_url = models.URLField(blank=True)

    class Meta:
        ordering = ['number']

    def __str__(self):
        return f'Temporada {self.number}' + (f' — {self.name}' if self.name else '')
