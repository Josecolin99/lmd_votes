from django.urls import path
from . import views

urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('dragas/', views.DragasView.as_view(), name='dragas'),
    path('dragas/nueva/', views.DragaFormView.as_view(), name='draga_form'),
    path('chapters/', views.ChaptersView.as_view(), name='chapters'),
    path('chapters/nuevo/', views.ChapterFormView.as_view(), name='chapter_form'),
    path('chapters/<int:chapter_id>/', views.ChapterDetailView.as_view(), name='chapter_detail'),
    path('usuarios/', views.UsuariosView.as_view(), name='usuarios'),
    path('usuarios/nuevo/', views.UsuarioFormView.as_view(), name='usuario_form'),
]
