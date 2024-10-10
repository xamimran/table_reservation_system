from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class BookingsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bookings'
    verbose_name = _('Bookings')
    verbose_name_plural = _("Bookings")
