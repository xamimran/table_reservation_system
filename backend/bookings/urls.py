from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TableView, UserProfileView, ReservationView, PaymentView, MealSlotTimeView

router = DefaultRouter()
router.register('table', TableView)
router.register('user_profile', UserProfileView)
router.register('reservation', ReservationView)
router.register('payment', PaymentView)
router.register('meal_slot_time', MealSlotTimeView)

urlpatterns = [
    path('', include(router.urls)),
]