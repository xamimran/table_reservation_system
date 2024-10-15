from typing import Any
from django.contrib import admin
from django.contrib.auth.models import Group
from django.http import HttpRequest
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
import stripe
import pdb
from django.urls import reverse
from django.middleware.csrf import get_token
from django.conf import settings
from .models import UserProfile, MealSlotTime, Table, Reservation, Payment

admin.site.site_header = "Fine Table"
# Register your models here.
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    # fields = ['first_name', 'last_name', 'duplicate_email','phone', 'user_notes']
    list_display = ['first_name', 'email', 'last_name', 'phone', 'user_notes']
    search_fields = ['first_name', 'last_name', 'email']
    list_filter = ['first_name', 'last_name', 'phone', 'user_notes']
    # exclude = ('is_staff', "is_active", "date_joined", "last_login", "password", "groups", "user_permissions", "is_superuser", 'email')

#     def save_model(self, request, obj, form, change):
#         if not obj.username: 
#             obj.username = obj.email 
#         super().save_model(request, obj, form, change)

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
    list_display = ['get_table_number', 'user_id', 'get_reservation_date', 'get_meal_type', 'display_no_show']
    list_filter = ['reservation_date', 'no_show']

    def display_no_show(self, obj):
        return _("No show ") if obj.no_show else ""
    
    display_no_show.short_description = _('Nessuno spettacolo')
    
    def get_table_number(self, obj):
        return obj.table_id.table_number
    def get_reservation_date(self, obj):
        return obj.reservation_date.date()

    get_table_number.short_description = _('Table Number')

    def get_meal_type(self, obj):
        return obj.slot_time_id.slot_name
    
    get_meal_type.short_description = _('Meal Type')

    # Corrected method signature for get_readonly_fields
    def get_readonly_fields(self, request: HttpRequest, obj=None):
        if obj:
            return ['user_id']
        return []
    

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'description', 'payment_date', 'payment_method_id', 'customer_id', 'get_stripe_payment_button')
    list_filter = ['payment_date']

    def get_queryset(self, request):
        self.request = request  # Make request available in other methods
        return super().get_queryset(request)
    
    def get_stripe_payment_button(self, obj):
        if obj.payment_method_id:
            payment_url = reverse('process_stripe_payment', args=[obj.id])  # Passes payment_id in the URL
            csrf_token = get_token(self.request)  # Get CSRF token for secure POST request
            return format_html(
                '''
                <button type="button" class="button" onclick="submitChargeForm('{}', '{}');">Charge Customer</button>
                <script>
                    function submitChargeForm(paymentUrl, csrfToken) {{
                        fetch(paymentUrl, {{
                            method: 'POST',
                            headers: {{
                                'X-CSRFToken': csrfToken,
                                'Content-Type': 'application/json'
                            }},
                        }})
                        .then(response => response.json())
                        .then(data => {{
                            if (data.success) {{
                                alert('Payment successful! Payment ID: ' + data.paymentIntentId);
                            }} else {{
                                alert('Payment failed: ' + data.error);
                            }}
                        }})
                        .catch(error => {{
                            console.error('Error:', error);
                            alert('An error occurred while processing the payment.');
                        }});
                    }}
                </script>
                ''',
                payment_url, csrf_token
            )
        return format_html('<a class="button" href="/admin/make_payment/{}/">Make Payment</a>', obj.id)

    get_stripe_payment_button.short_description = 'Stripe Payment'

    # Capture the request object using a custom method and set it on the instance
    def changelist_view(self, request, extra_context=None):
        self.request = request  # Set request on the instance
        return super().changelist_view(request, extra_context)
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
# admin.site.unregister(Payment)