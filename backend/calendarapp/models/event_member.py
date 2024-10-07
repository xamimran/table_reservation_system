from django.db import models

from accounts.models import User
from calendarapp.models import Event, EventAbstract
from django.utils.translation import gettext_lazy as _


class EventMember(EventAbstract):
    """ Event member model """

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="events")
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="event_members"
    )

    class Meta:
        unique_together = ["event", "user"]
        verbose_name = _("Event Member")
        verbose_name_plural = _("Event Members")

    def __str__(self):
        return str(self.user)
