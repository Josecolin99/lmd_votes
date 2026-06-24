from rest_framework.routers import DefaultRouter
from .views import ChapterViewSet

router = DefaultRouter()
router.register(r'chapters', ChapterViewSet, basename='chapter')

urlpatterns = router.urls
