from django.db import models

# Create your models here.

from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    f_name = models.CharField(max_length=50)
    l_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=12)
    user_notes = models.TextField()

class MealSlotTime(models.Model):
    slot_name = models.CharField(max_length=50)
    start_time = models.TimeField()
    end_time = models.TimeField()

class Table(models.Model):
    table_number = models.IntegerField()
    is_available = models.BooleanField(default=True)
    slot_time_id = models.ForeignKey(MealSlotTime, on_delete=models.CASCADE)
    adults = models.IntegerField()
    children = models.IntegerField()

class Reservation(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    table_id = models.ForeignKey(Table, on_delete=models.CASCADE)
    description = models.TextField(max_length=50)
    reservation_date = models.DateField()

class Payment(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    reservation_id = models.ForeignKey(Reservation, on_delete=models.CASCADE)
    description = models.CharField(max_length=50) # Fix here
    table_id = models.ForeignKey(Table, on_delete=models.CASCADE)
    stripe_payment_id = models.IntegerField()
    amount = models.IntegerField()
    payment_date = models.DateField()