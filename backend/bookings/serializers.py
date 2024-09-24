
from rest_framework import serializers
from .models import UserProfile, MealSlotTime, Table, Reservation, Payment

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['first_name', 'last_name', 'email','phone', 'user_notes']

class MealSlotTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealSlotTime
        fields = '__all__'

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = '__all__'

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'