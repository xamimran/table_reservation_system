from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import datetime
import pdb
from .models import MealSlotTime, Table, UserProfile, Reservation, Payment
from .serializers import MealSlotTimeSerializer, TableSerializer, UserProfileSerializer, ReservationSerializer, PaymentSerializer
# Create your views here.


class UserProfileView(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    queryset = UserProfile.objects.all()

class MealSlotTimeView(viewsets.ModelViewSet):
    serializer_class = MealSlotTimeSerializer
    queryset = MealSlotTime.objects.all()

class TableView(viewsets.ModelViewSet):
    serializer_class = TableSerializer
    queryset = Table.objects.all()

    @action(detail=False, methods=['get'])
    def check_availability(self, request):
        date = request.query_params.get('reservation_date')
        slot_time_id = request.query_params.get('slot_time_id')
        adults = int(request.query_params.get('adults'))
        children = int(request.query_params.get('children'))
        if not date or not slot_time_id:
            return Response({"message": "Date and slot time are required."}, status=400)
        try:
            reservation_date = datetime.strptime(date, '%d-%m-%y').date()
        except ValueError:
            return Response({"message": "Invalid date format. Use 'dd-mm-yy'."}, status=400)
        reserved_tables = Reservation.objects.filter( reservation_date = reservation_date, slot_time_id = slot_time_id).values_list('table_id', flat=True)

        available_table = Table.objects.filter(adults__gte = adults,children__gte = children).exclude(id__in = reserved_tables ).values_list('id', flat=True).first()

        if available_table is not None:
            return Response({"available_table": available_table})
        else:
            return Response({"message": "No tables available."})

class ReservationView(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    queryset = Reservation.objects.all()

class PaymentView(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    queryset = Payment.objects.all()


