from django.urls import path
from .views import UsuariosAPIView

urlpatterns = [
    path('usuarios/', UsuariosAPIView.as_view(), name='api_usuarios'),
]
