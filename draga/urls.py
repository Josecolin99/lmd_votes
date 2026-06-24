from rest_framework.routers import DefaultRouter
from .views import DragaViewSet

router = DefaultRouter()
router.register(r'dragas', DragaViewSet, basename='draga')

urlpatterns = router.urls
