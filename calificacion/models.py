from django.db import models
from django.contrib.auth.models import User


class Calificacion(models.Model):
    user    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calificaciones')
    draga   = models.ForeignKey('draga.Draga', on_delete=models.CASCADE, related_name='calificaciones')
    chapter = models.ForeignKey('chapter.Chapter', on_delete=models.CASCADE, related_name='calificaciones')
    score   = models.FloatField()
    extended = models.BooleanField(default=False)

    class Meta:
        unique_together = ['user', 'draga', 'chapter']
        ordering = ['-score']

    def __str__(self):
        return f'{self.user.username} | {self.draga.name} — Cap {self.chapter.number}: {self.score}'
