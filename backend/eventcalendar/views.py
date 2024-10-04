from django.views.generic import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
import pdb
from bookings.models import Reservation
from calendarapp.models import Event


class DashboardView(LoginRequiredMixin, View):
    login_url = "accounts:signin"
    template_name = "calendarapp/dashboard.html"

    def get(self, request, *args, **kwargs):
        events = Event.objects.get_all_events(user=request.user)
        running_events = Event.objects.get_running_events(user=request.user)
        total_reservations = Reservation.objects.filter().order_by("-id")[:10]
        # latest_events = Event.objects.filter(user=request.user).order_by("-id")[:10]
        context = {
            "total_event": total_reservations.count(),
            "running_events": running_events,
            "total_reservations": total_reservations,
        }
        return render(request, self.template_name, context)
