from django.urls import path
from . import views

urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),

    # Temporadas
    path('temporadas/', views.TemporadasView.as_view(), name='temporadas'),
    path('temporadas/nueva/', views.TemporadaFormView.as_view(), name='temporada_form'),
    path('temporadas/<int:t_id>/', views.TemporadaDetailView.as_view(), name='temporada_detail'),

    # Dragas (scoped a temporada)
    path('temporadas/<int:t_id>/dragas/nueva/', views.DragaFormView.as_view(), name='draga_form'),

    # Chapters (scoped a temporada)
    path('temporadas/<int:t_id>/chapters/nuevo/', views.ChapterFormView.as_view(), name='chapter_form'),
    path('temporadas/<int:t_id>/chapters/<int:c_id>/', views.ChapterDetailView.as_view(), name='chapter_detail'),

    # Usuarios (admin)
    path('usuarios/', views.UsuariosView.as_view(), name='usuarios'),
    path('usuarios/nuevo/', views.UsuarioFormView.as_view(), name='usuario_form'),
]
