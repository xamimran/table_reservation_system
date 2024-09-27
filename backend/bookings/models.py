from django.db import models

# Create your models here.

from django.contrib.auth.models import AbstractUser

class UserProfile(AbstractUser):
    phone = models.CharField(max_length=12)
    user_notes = models.TextField()

    def __str__(self) -> str:
        return f"(id: {self.id}) {self.first_name} {self.last_name}"

class MealSlotTime(models.Model):
    slot_name = models.CharField(max_length=50)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self) -> str:
        return f"{self.slot_name} ({self.start_time} - {self.end_time})"

class Table(models.Model):
    table_number = models.IntegerField(unique=True)
    is_available = models.BooleanField(default=True)
    slot_time_id = models.ForeignKey(MealSlotTime, on_delete=models.CASCADE)
    adults = models.IntegerField()
    children = models.IntegerField()

    def __str__(self) -> str:
        return f"Table Number: {self.table_number} ({'Avliable' if self.is_available else 'Not Avliable'})"

class Reservation(models.Model):
    user_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    table_id = models.ForeignKey(Table, on_delete=models.CASCADE)
    description = models.TextField(max_length=50)
    reservation_date = models.DateField()
    payment_status = models.BooleanField(default=False)
    slot_time_id = models.ForeignKey(MealSlotTime, on_delete=models.CASCADE, default=0)
    no_show = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f"Reservation for {self.user_id.first_name.capitalize() } {self.user_id.last_name.capitalize()} on {self.reservation_date}"
    
class PaymentStaus(models.TextChoices):
    PENDING = 'P', 'Pending'
    PAID = 'PA', 'Paid'
    FAILED = 'F', 'Failed'

class Payment(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    reservation_id = models.ForeignKey(Reservation, on_delete=models.CASCADE)
    description = models.CharField(max_length=50) # Fix here
    table_id = models.ForeignKey(Table, on_delete=models.CASCADE)
    stripe_payment_id = models.IntegerField()
    amount = models.IntegerField()
    payment_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=2, choices=PaymentStaus.choices, default=PaymentStaus.PENDING)

    def __str__(self) -> str:
        return f"Payment for {self.user} on {self.payment_date} is in {self.get_status_display()}"