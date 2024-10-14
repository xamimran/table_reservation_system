from django.shortcuts import render
from django.db.models import F, Value, IntegerField
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets
from django.db.models.functions import Greatest
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404
import stripe
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import datetime
from django.core.serializers import serialize
from django.http import JsonResponse
import calendar
from django.conf import settings

# Set the Stripe API key
stripe.api_key = settings.STRIPE_SECRET_KEY
from calendarapp.models import Event
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
    def check_month_availability(self, request):
        # Get the month and year from query params
        month = request.query_params.get('month')
        year = request.query_params.get('year')

        if not month or not year:
            return Response({"message": "Month and year are required."}, status=400)

        try:
            month = int(month)
            year = int(year)
            first_day_of_month = datetime(year, month, 1).date()
        except ValueError:
            return Response({"message": "Invalid month or year."}, status=400)

        # Get the number of days in the month
        num_days = calendar.monthrange(year, month)[1]

        reserved_tables_by_day = {}
        available_tables_by_day = {}

        # Iterate over each day of the month
        for day in range(1, num_days + 1):
            current_date = datetime(year, month, day).date()

            # Query for total reserved tables for the current day (across all slots)
            reserved_tables_count = Reservation.objects.filter(
                reservation_date__date=current_date
            ).count()

            # Query for total available tables for the current day (across all slots)
            total_tables_count = Table.objects.count()
            available_tables_count = total_tables_count - reserved_tables_count

            # Store results by date in dictionaries
            reserved_tables_by_day[str(current_date)] = reserved_tables_count
            available_tables_by_day[str(current_date)] = available_tables_count

        # Return results in JSON format
        return Response({
            "reserved_tables_by_day": reserved_tables_by_day,
            "available_tables_by_day": available_tables_by_day
        })
    
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

        if Event.objects.filter(start_time__date__lte=reservation_date,end_time__date__gt=reservation_date,is_active=True,is_deleted=False).exists():
            return Response({"message": "No reservations can be made on this date due to restaurant unavailability."}, status=400)

        # Proceed with the existing logic to check for table availability
        reserved_tables = Reservation.objects.filter(
            reservation_date=reservation_date,
            slot_time_id=slot_time_id
        ).values_list('table_id', flat=True)

        available_table = Table.objects.filter(
            adults__gte=adults,
            children__gte=children
        ).exclude(id__in=reserved_tables).annotate(
            adult_surplus=F('adults') - Value(adults, output_field=IntegerField()),
            child_surplus=F('children') - Value(children, output_field=IntegerField()),
            total_surplus=Greatest(
                F('adults') - adults,
                F('children') - children
            )
        ).order_by('total_surplus').first()
        if available_table:
            table_data = {
                "id": available_table.id,
                "table_number": available_table.table_number,
                "adults": available_table.adults,
                "children": available_table.children
            }
            return JsonResponse(table_data)
        else:
            return Response({"message": "No available tables found for the given criteria."}, status=404)

class ReservationView(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    queryset = Reservation.objects.all()

class PaymentView(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    queryset = Payment.objects.all()

@csrf_exempt
def process_stripe_payment(request, payment_id):
    if request.method == 'POST':
        payment = get_object_or_404(Payment, id=payment_id)
        try:
            # Create a PaymentIntent
            intent = stripe.PaymentIntent.create(
                amount=payment.amount*100,
                currency='eur',
                customer=payment.customer_id,
                payment_method=payment.payment_method_id,
                off_session=True,
                confirm=True
            )
            return JsonResponse({'success': True, 'paymentIntentId': intent.id})
        except stripe.error.StripeError as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    else:
        return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=400)
