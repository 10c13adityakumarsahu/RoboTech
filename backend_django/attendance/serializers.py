from rest_framework import serializers
from .models import AttendanceSession, AttendanceRecord
from users.serializers import UserSerializer
from users.models import User, MemberProfile

class AttendanceRecordSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    
    class Meta:
        model = AttendanceRecord
        fields = ['id', 'session', 'user', 'user_details', 'status', 'timestamp']
        read_only_fields = ['timestamp']

    def get_user_details(self, obj):
        # Lightweight user details for the list
        try:
            p = obj.user.profile
            return {
                'id': obj.user.id,
                'full_name': p.full_name,
                'roll_number': p.roll_number,
                'sig': p.sig,
                'year': p.year
            }
        except:
            return {'id': obj.user.id, 'username': obj.user.username}

class AttendanceSessionSerializer(serializers.ModelSerializer):
    stats = serializers.SerializerMethodField()
    # Accept fields for creation
    target_sigs_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)

    class Meta:
        model = AttendanceSession
        fields = [
            'id', 'title', 'date', 'created_by', 
            'scope_type', 'target_sigs', 'target_sigs_ids', 'target_years', 
            'status', 'created_at', 'stats'
        ]
        read_only_fields = ['created_by', 'created_at', 'stats', 'target_sigs']

    def get_stats(self, obj):
        total = obj.records.count()
        present = obj.records.filter(status='PRESENT').count()
        excused = obj.records.filter(status='EXCUSED').count()
        absent = total - present - excused
        return {
            'total': total,
            'present': present,
            'absent': absent,
            'excused': excused
        }

    def create(self, validated_data):
        sig_ids = validated_data.pop('target_sigs_ids', [])
        session = AttendanceSession.objects.create(**validated_data)
        if sig_ids:
            session.target_sigs.set(sig_ids)
        return session
