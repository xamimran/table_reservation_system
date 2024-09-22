from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
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

class ReservationView(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    queryset = Reservation.objects.all()

class PaymentView(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    queryset = Payment.objects.all()


