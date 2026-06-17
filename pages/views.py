from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User


class AdminRequiredMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()
        if not request.user.is_staff:
            return redirect('home')
        return super().dispatch(request, *args, **kwargs)


class HomeView(LoginRequiredMixin, TemplateView):
    template_name = 'pages/home.html'


class DragasView(LoginRequiredMixin, TemplateView):
    template_name = 'pages/dragas.html'


class DragaFormView(AdminRequiredMixin, TemplateView):
    template_name = 'pages/draga_form.html'


class ChaptersView(LoginRequiredMixin, TemplateView):
    template_name = 'pages/chapters.html'


class ChapterFormView(AdminRequiredMixin, TemplateView):
    template_name = 'pages/chapter_form.html'


class ChapterDetailView(LoginRequiredMixin, TemplateView):
    template_name = 'pages/chapter_detail.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['chapter_id'] = self.kwargs['chapter_id']
        return context


class UsuariosView(AdminRequiredMixin, TemplateView):
    template_name = 'pages/usuarios.html'


class UsuarioFormView(AdminRequiredMixin, TemplateView):
    template_name = 'pages/usuario_form.html'


class UsuariosAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN)
        users = User.objects.all().values('id', 'username', 'is_staff', 'date_joined')
        return Response(list(users))

    def post(self, request):
        if not request.user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN)
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        is_staff = request.data.get('is_staff', False)
        if not username or not password:
            return Response({'error': 'Username y password son requeridos.'}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({'username': ['Este nombre de usuario ya existe.']}, status=400)
        user = User.objects.create_user(username=username, password=password, is_staff=is_staff)
        return Response({'id': user.id, 'username': user.username, 'is_staff': user.is_staff}, status=201)
