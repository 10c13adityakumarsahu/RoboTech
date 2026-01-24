from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AnnouncementViewSet, GalleryViewSet, SponsorshipViewSet, 
    ContactMessageViewSet, FormViewSet, FormSectionViewSet, 
    FormFieldViewSet, FormResponseViewSet
)

router = DefaultRouter()
router.register(r'announcements', AnnouncementViewSet, basename='announcements')
router.register(r'gallery', GalleryViewSet, basename='gallery')
router.register(r'sponsorship', SponsorshipViewSet, basename='sponsorship')
router.register(r'contact-messages', ContactMessageViewSet, basename='contact-messages')
router.register(r'forms', FormViewSet, basename='forms')
router.register(r'form-sections', FormSectionViewSet, basename='form-sections')
router.register(r'form-fields', FormFieldViewSet, basename='form-fields')
router.register(r'form-responses', FormResponseViewSet, basename='form-responses')

urlpatterns = [
    path('', include(router.urls)),
]
