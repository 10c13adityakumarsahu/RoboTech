from django.db import models
from django.conf import settings
from users.models import Sig

class AttendanceSession(models.Model):
    SCOPE_CHOICES = [
        ('GLOBAL', 'Global (All Members)'),
        ('SIG', 'SIG Specific'),
        ('CUSTOM', 'Custom Selection'),
    ]

    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('OPEN', 'Open (Marking in progress)'),
        ('FINALIZED', 'Finalized'),
    ]

    title = models.CharField(max_length=200, default="General Meeting")
    date = models.DateTimeField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_attendance_sessions')
    
    scope_type = models.CharField(max_length=20, choices=SCOPE_CHOICES, default='GLOBAL')
    
    # Filters used to generate the list
    target_sigs = models.ManyToManyField(Sig, blank=True, related_name='attendance_sessions', help_text="If scope is SIG, which SIGs?")
    target_years = models.JSONField(default=list, blank=True, help_text="List of years [1, 2, 3, 4] included. Empty = All.")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.date.date()})"

class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('EXCUSED', 'Excused'),
    ]

    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='records')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attendance_records')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ABSENT')
    
    marked_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='marked_records')
    timestamp = models.DateTimeField(auto_now=True) # Last updated

    class Meta:
        unique_together = ('session', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.status} @ {self.session}"
