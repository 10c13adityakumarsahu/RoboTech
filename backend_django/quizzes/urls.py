from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuestionViewSet, QuizAttemptViewSet, OptionViewSet

router = DefaultRouter()
router.register(r'quizzes', QuizViewSet, basename='quizzes')
router.register(r'questions', QuestionViewSet, basename='questions')
router.register(r'options', OptionViewSet, basename='options')
router.register(r'attempts', QuizAttemptViewSet, basename='attempts')

urlpatterns = [
    path('', include(router.urls)),
]
