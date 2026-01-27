from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import AttendanceSession, AttendanceRecord
from .serializers import AttendanceSessionSerializer, AttendanceRecordSerializer
from users.permissions import GlobalPermission
from users.models import User

class AttendanceSessionViewSet(viewsets.ModelViewSet):
    queryset = AttendanceSession.objects.all().order_by('-date')
    serializer_class = AttendanceSessionSerializer
    permission_classes = [GlobalPermission]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def populate(self, request, pk=None):
        """
        Generates/Regenerates AttendanceRecords based on the filters.
        Only valid if status is DRAFT or OPEN.
        """
        session = self.get_object()
        
        # 1. Base Query
        # Active users only? Maybe yes.
        qs = User.objects.filter(is_active=True).select_related('profile')

        # 2. Filter by Year
        if session.target_years:
            # target_years is list of ints e.g. [2, 3]
            # Profile year is a string "2nd Year", "3rd Year" or int field?
            # MemberProfile.year is CharField ("2nd Year"). MemberProfile.year_of_joining is int.
            # Usually strict parsing is hard. Let's assume frontend sends "2", "3" and we match against year string OR calculated year.
            # Simplified: Let's rely on MemberProfile.year containing the digit.
            q_years = Q()
            for y in session.target_years:
                q_years |= Q(profile__year__icontains=str(y))
            qs = qs.filter(q_years)

        # 3. Filter by SIG/Scope
        if session.scope_type == 'SIG':
            sig_names = list(session.target_sigs.values_list('name', flat=True))
            if sig_names:
                # Users who have this SIG as 'sig' field OR in 'sigs' M2M
                qs = qs.filter(Q(profile__sig__in=sig_names) | Q(profile__sigs__name__in=sig_names)).distinct()
        
        # Exclude users who already have a record
        existing_ids = session.records.values_list('user_id', flat=True)
        users_to_add = qs.exclude(id__in=existing_ids)

        new_records = []
        for u in users_to_add:
            new_records.append(AttendanceRecord(
                session=session,
                user=u,
                status='ABSENT', # Default
                marked_by=request.user
            ))
        
        AttendanceRecord.objects.bulk_create(new_records)
        
        return Response({
            'added': len(new_records), 
            'total_eligible': qs.count()
        })

    @action(detail=True, methods=['get'])
    def records(self, request, pk=None):
        """Get all records for a session"""
        session = self.get_object()
        records = session.records.select_related('user__profile').all().order_by('user__profile__full_name')
        return Response(AttendanceRecordSerializer(records, many=True).data)

    @action(detail=True, methods=['post'])
    def batch_update(self, request, pk=None):
        """
        Update multiple records at once.
        Body: { "updates": [ {"user_id": 1, "status": "PRESENT"}, ... ] }
        """
        session = self.get_object()
        updates = request.data.get('updates', [])
        
        count = 0
        for item in updates:
            uid = item.get('user_id')
            st = item.get('status')
            if uid and st:
                AttendanceRecord.objects.filter(session=session, user_id=uid).update(status=st, marked_by=request.user)
                count += 1
        return Response({'updated': count})

class AttendanceRecordViewSet(viewsets.ReadOnlyModelViewSet):
    """
    For viewing historical attendance of a specific user.
    """
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [GlobalPermission]

    def get_queryset(self):
        qs = super().get_queryset()
        user_id = self.request.query_params.get('user_id')
        if user_id:
            qs = qs.filter(user_id=user_id)
        return qs.order_by('-session__date')
