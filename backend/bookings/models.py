from django.db import models
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.conf import settings
from django.core.mail import send_mail
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _
from calendarapp.models import Event
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractUser
import pdb

class UserProfile(models.Model):
    email = models.EmailField(max_length=255, unique=False, null=True, blank=True)
    first_name = models.CharField(_("First Name"), max_length=50, null=True, blank=True)
    last_name = models.CharField(_("Last Name"), max_length=50, null=True, blank=True)
    phone = models.CharField(_("Phone"), max_length=12, null=True, blank=True)
    user_notes = models.TextField(_("User Notes"), null=True, blank=True)
    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}"

class MealSlotTime(models.Model):
    slot_name = models.CharField(_("Slot Name"), max_length=50)
    start_time = models.TimeField(_("Start Time"))
    end_time = models.TimeField(_("End Time"))
    def __str__(self) -> str:
        return f"{self.slot_name}"
    
    class Meta:
        verbose_name = _("Meal Slot Time")
        verbose_name_plural = _("Meals Time")

class Table(models.Model):
    table_number = models.IntegerField(_("Table Number"), unique=True)
    is_available = models.BooleanField(_("Available"), default=True)
    adults = models.IntegerField(_("Adults"))
    children = models.IntegerField(_("Children"))

    def __str__(self) -> str:
        return f"{self.table_number}"

    class Meta:
        verbose_name = _("Table")
        verbose_name_plural = _("Tables List")

class Reservation(models.Model):
    user_id = models.ForeignKey(UserProfile, verbose_name=_("User"), on_delete=models.CASCADE)
    table_id = models.ForeignKey(Table, verbose_name=_("Table"), on_delete=models.CASCADE, default=1)
    reservation_date = models.DateTimeField(_("Reservation Date"))
    payment_status = models.BooleanField(_("Payment Status"), default=False)
    slot_time_id = models.ForeignKey(MealSlotTime, verbose_name=_("Meal Slot"), on_delete=models.CASCADE, default=0)
    no_show = models.BooleanField(_('No Show'), default=False)

    def __str__(self) -> str:
        return _("Reservation for {user} on {date}").format(user=self.user_id, date=self.reservation_date)

    class Meta:
        verbose_name = _("Reservation")
        verbose_name_plural = _("Reservation List")

    def clean(self):
    # Check if required fields are set
        if not self.reservation_date or not self.slot_time_id or not self.table_id:
            raise ValidationError(_("Reservation date, slot time, and table must be specified."))
    
        reservation_date = self.reservation_date.date()
    
        # If updating an existing reservation, check if reservation details changed
        if self.pk:
            existing_reservation = Reservation.objects.get(pk=self.pk)
            
            # Skip availability checks if reservation details are unchanged
            if (existing_reservation.reservation_date == self.reservation_date and
                existing_reservation.table_id == self.table_id and
                existing_reservation.slot_time_id == self.slot_time_id):
                return
    
        # Check for event conflicts
        events = Event.objects.filter(
            start_time__date__lte=reservation_date,
            end_time__date__gt=reservation_date,
            is_active=True,
            is_deleted=False
        )
        if events.exists():
            raise ValidationError(_("Cannot reserve a table on {date} because there is an event scheduled.").format(date=self.reservation_date))
    
        # Check for table availability by excluding any tables that are already reserved
        reserved_tables = Reservation.objects.filter(reservation_date__date=reservation_date,slot_time_id=self.slot_time_id).values_list('table_id', flat=True)
    
        # Ensure the specified table is not in the reserved list
        if self.table_id.id in reserved_tables:
            raise ValidationError(_("Table {table_number} is already reserved on {date} for the selected time slot. Select another date or time slot").format(
                table_number=self.table_id.table_number, date=self.reservation_date
            ))
    
        # Ensure there is at least one available table for the given requirements
        available_table_exists = Table.objects.filter(
            id=self.table_id.id,  # Check only the specific table
            adults__gte=self.table_id.adults,
            children__gte=self.table_id.children
            is_available = True
        ).exclude(id__in=reserved_tables).exists()
    
        if not available_table_exists:
            raise ValidationError(_("No available tables found for the given criteria on {date}.").format(date=self.reservation_date))

    def save(self, *args, **kwargs):
        # Check if payment status has changed
        if self.pk:
            # Existing reservation, check if payment_status was changed to True
            old_reservation = Reservation.objects.get(pk=self.pk)
            if not old_reservation.payment_status and self.payment_status:
                # Payment status changed to True, send the confirmation email
                self.send_reservation_email()
        
        # Save the reservation as usual
        super().save(*args, **kwargs)

    def send_reservation_email(self):
        user = self.user_id
        table = self.table_id
        meal_slot = self.slot_time_id

        subject = _('Your Reservation Confirmation at Fine Table')
        message = _("""
        <html>
            <body style="font-family: Arial, sans-serif; color: black; font-size: 16px;">
                <p><strong>Dear {name},</strong></p>
                <p>Thank you for choosing Fine Table! We are pleased to confirm your reservation. 🍽️</p>
                <p><strong>Reservation Details:</strong></p>
                <p>
                    Name: {name} 🌟<br>
                    Phone Number: {phone} 📞<br>
                    Reservation Date: {date} 📅<br>
                    Meal Type: {meal_type} 🍴<br>
                    Meal Time: {meal_start} - {meal_end} ⏰<br>
                    Number of Adults: {adults} 👨‍👩‍👧‍👦<br>
                    Number of Children: {children} 👶<br>
                    Assigned Table: {table} 🪑<br>
                </p>
            </body>
        </html>
        """).format(
            name=f"{user.first_name} {user.last_name}",
            phone=user.phone,
            date=self.reservation_date,
            meal_type=meal_slot.slot_name,
            meal_start=meal_slot.start_time.strftime('%I:%M %p'),
            meal_end=meal_slot.end_time.strftime('%I:%M %p'),
            adults=table.adults,
            children=table.children,
            table=table.table_number
        )

        recipient_list = [user.email]
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            recipient_list,
            fail_silently=False,
            html_message=message,
        )

class PaymentStaus(models.TextChoices):
    PENDING = 'P', _('Pending')
    PAID = 'PA', _('Paid')
    FAILED = 'F', _('Failed')

class Payment(models.Model):
    user = models.ForeignKey(UserProfile, verbose_name=_("User"), on_delete=models.CASCADE)
    reservation_id = models.ForeignKey(Reservation, verbose_name=_("Reservation"), on_delete=models.CASCADE)
    description = models.CharField(_("Description"), max_length=50)
    table_id = models.ForeignKey(Table, verbose_name=_("Table"), on_delete=models.CASCADE)
    payment_method_id = models.CharField(_("Stripe Payment ID"),max_length=100)
    amount = models.IntegerField(_("Amount"))
    payment_date = models.DateField(_("Payment Date"), auto_now_add=True)
    customer_id = models.CharField(_("Customer ID"),max_length=100, null=True, blank=True)
    status = models.CharField(_("Status"), max_length=2, choices=PaymentStaus.choices, default=PaymentStaus.PENDING)
