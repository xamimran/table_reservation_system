from django.db import models
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.conf import settings
from django.core.mail import send_mail
from django.dispatch import receiver
from accounts.models import User
from calendarapp.models import Event
import pdb
# Create your models here.

from django.contrib.auth.models import AbstractUser

class UserProfile(User):

    def __str__(self) -> str:
        return f"(id: {self.id}) {self.first_name} {self.last_name}"

class MealSlotTime(models.Model):
    slot_name = models.CharField(max_length=50)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self) -> str:
        return f"{self.slot_name}"

class Table(models.Model):
    table_number = models.IntegerField(unique=True)
    is_available = models.BooleanField(default=True)
    adults = models.IntegerField()
    children = models.IntegerField()

    def __str__(self) -> str:
        return f"{self.table_number}"

class Reservation(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    table_id = models.ForeignKey(Table, on_delete=models.CASCADE)
    description = models.TextField(max_length=50)
    reservation_date = models.DateTimeField()
    payment_status = models.BooleanField(default=False)
    slot_time_id = models.ForeignKey(MealSlotTime, on_delete=models.CASCADE, default=0)
    no_show = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f"Reservation for {self.user_id.first_name.capitalize() } {self.user_id.last_name.capitalize()} on {self.reservation_date}"
    class Meta:
        verbose_name = "Reservation"
        verbose_name_plural = "Reservation List"
    
    def clean(self):
        # Check for events on the reservation date
        events = Event.objects.filter(start_time__date=self.reservation_date)  # Adjust this if you want to consider time as well
        if events.exists():
            raise ValidationError(f"Cannot reserve a table on {self.reservation_date} because there is an event scheduled.")

    def save(self, *args, **kwargs):
        self.clean()  # Call the clean method to validate before saving
        super().save(*args, **kwargs)
        
@receiver(post_save, sender=Reservation)
def send_reservation_email(sender, instance, created, **kwargs):
    if created:  # Check if this is a new reservation
        user = instance.user_id
        table = instance.table_id
        meal_slot = instance.slot_time_id
        
        subject = 'Your Reservation Confirmation at Fine Table'
        message = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: black; font-size: 16px;">
                <p><strong>Dear {user.first_name} {user.last_name} ,</strong></p>
                <p>Thank you for choosing Fine Table! We are pleased to confirm your reservation. 🍽️</p>
                <p><strong>Reservation Details:</strong></p>
                <p>
                    Name: {user.first_name} {user.last_name} 🌟<br>
                    Phone Number: {user.phone} 📞<br>
                    Reservation Date: {instance.reservation_date} 📅<br>
                    Meal Type: {meal_slot.slot_name} 🍴<br>
                    Meal Time: {meal_slot.start_time.strftime('%I:%M %p')} - {meal_slot.end_time.strftime('%I:%M %p')} ⏰<br>
                    Number of Adults: {table.adults} 👨‍👩‍👧‍👦<br>
                    Number of Children: {table.children} 👶<br>
                    Assigned Table: {table.table_number} 🪑<br>
                </p>
            </body>
        </html>
        """

        recipient_list = [user.email]
        # Send the email
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,  # Ensure this is set in settings.py
            recipient_list,
            fail_silently=False,
            html_message=message,  # Pass the HTML message
        )

  
class PaymentStaus(models.TextChoices):
    PENDING = 'P', 'Pending'
    PAID = 'PA', 'Paid'
    FAILED = 'F', 'Failed'

class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reservation_id = models.ForeignKey(Reservation, on_delete=models.CASCADE)
    description = models.CharField(max_length=50) # Fix here
    table_id = models.ForeignKey(Table, on_delete=models.CASCADE)
    stripe_payment_id = models.IntegerField()
    amount = models.IntegerField()
    payment_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=2, choices=PaymentStaus.choices, default=PaymentStaus.PENDING)

    def __str__(self) -> str:
        return f"Payment for {self.user} on {self.payment_date} is in {self.get_status_display()}"