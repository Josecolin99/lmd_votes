from django.db import models


class Chapter(models.Model):
    temporada = models.ForeignKey('temporada.Temporada', on_delete=models.CASCADE, related_name='chapters')
    number    = models.PositiveSmallIntegerField()
    name      = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['number']

    def __str__(self):
        return f'Capítulo {self.number}' + (f' — {self.name}' if self.name else '')
