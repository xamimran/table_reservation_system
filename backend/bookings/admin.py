from typing import Any
from django.contrib import admin
from django.contrib.auth.models import Group
from django.http import HttpRequest
from django.utils.html import format_html
import stripe
from django.conf import settings
from .models import UserProfile, MealSlotTime, Table, Reservation, Payment

admin.site.site_header = "Fine Table"
# Register your models here.
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    fields = ['first_name', 'last_name', 'email','phone', 'user_notes']
    list_display = ['first_name', 'last_name', 'email', 'phone', 'user_notes']
    search_fields = ['first_name', 'last_name', 'email']
    list_filter = ['first_name', 'last_name', 'email', 'phone', 'user_notes']

    def save_model(self, request, obj, form, change):
        if not obj.username: 
            obj.username = obj.email 
        super().save_model(request, obj, form, change)

@admin.register(MealSlotTime)
class MealSlotTimeAdmin(admin.ModelAdmin):
    list_display = ['slot_name', 'start_time', 'end_time']
    list_filter = ['slot_name', 'start_time']
@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ['table_number', 'is_available', 'adults', 'children']
    list_filter = ['table_number', 'is_available']

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['get_table_number', 'description', 'reservation_date', 'get_meal_type', 'display_no_show']
    list_filter = ['reservation_date', 'no_show']

    def display_no_show(self, obj):
        return "No show " if obj.no_show else ""
    
    def get_table_number(self, obj):
        return obj.table_id.table_number

    get_table_number.short_description = 'Table Number'

    def get_meal_type(self, obj):
        return obj.slot_time_id.slot_name
    
    get_meal_type.short_description = 'Meal Type'

    # Corrected method signature for get_readonly_fields
    def get_readonly_fields(self, request: HttpRequest, obj=None):
        if obj:
            return ['user_id']
        return []
    

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'description', 'payment_date', 'stripe_payment')
    list_filter = ['payment_date']

    # Custom method to link to Stripe Payment
    def stripe_payment(self, obj):
        if obj.stripe_payment_id:
            return format_html(f'<a href="https://dashboard.stripe.com/test/payments/{obj.stripe_payment_id}" target="_blank">View Payment</a>')
        return format_html(f'<a class="button" href="/admin/make_payment/{obj.id}/">Make Payment</a>')

    stripe_payment.short_description = 'Stripe Payment'

    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path('make_payment/<int:payment_id>/', self.admin_site.admin_view(self.make_payment), name='make_payment'),
        ]
        return custom_urls + urls

    def make_payment(self, request, payment_id):
        payment = Payment.objects.get(id=payment_id)
        try:
            # Create a Payment Intent
            intent = stripe.PaymentIntent.create(
                amount=int(payment.amount * 100),  # Stripe uses cents
                currency='usd',
                metadata={'payment_id': payment.id},
            )

            # Save the Stripe payment ID
            payment.stripe_payment_id = intent['id']
            payment.save()

            self.message_user(request, "Stripe payment initiated successfully.")
        except Exception as e:
            self.message_user(request, f"Error creating Stripe payment: {str(e)}", level='error')

        # Redirect back to the payment list
        return redirect(f'/admin/app_name/payment/{payment.id}/change/')

admin.site.unregister(Group)
admin.site.unregister(Payment)