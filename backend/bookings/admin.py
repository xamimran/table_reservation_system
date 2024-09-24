from django.contrib import admin
from django.utils.html import format_html
import stripe
from django.conf import settings
from .models import UserProfile, MealSlotTime, Table, Reservation, Payment
stripe.api_key = settings.STRIPE_SECRET_KEY
# Register your models here.
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    fields = ['first_name', 'last_name', 'email','phone', 'user_notes']
    list_display = ['username','first_name', 'email', 'phone', 'user_notes']
    search_fields = ['first_name', 'last_name', 'email']
    list_filter = ['first_name', 'last_name', 'email', 'phone', 'user_notes']

@admin.register(MealSlotTime)
class MealSlotTimeAdmin(admin.ModelAdmin):
    list_display = ['slot_name', 'start_time', 'end_time']
    list_filter = ['slot_name', 'start_time']
@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ['table_number', 'is_available', 'slot_time_id', 'adults', 'children']
    list_filter = ['table_number', 'is_available']

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'table_id', 'description', 'reservation_date', 'slot_time_id']
    list_filter = ['reservation_date']

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
