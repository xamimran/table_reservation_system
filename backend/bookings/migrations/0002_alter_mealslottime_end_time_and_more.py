# Generated by Django 4.2.13 on 2024-10-06 21:23

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('bookings', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mealslottime',
            name='end_time',
            field=models.TimeField(verbose_name='End Time'),
        ),
        migrations.AlterField(
            model_name='mealslottime',
            name='slot_name',
            field=models.CharField(max_length=50, verbose_name='Slot Name'),
        ),
        migrations.AlterField(
            model_name='mealslottime',
            name='start_time',
            field=models.TimeField(verbose_name='Start Time'),
        ),
        migrations.AlterField(
            model_name='payment',
            name='amount',
            field=models.IntegerField(verbose_name='Amount'),
        ),
        migrations.AlterField(
            model_name='payment',
            name='description',
            field=models.CharField(max_length=50, verbose_name='Description'),
        ),
        migrations.AlterField(
            model_name='payment',
            name='payment_date',
            field=models.DateField(auto_now_add=True, verbose_name='Payment Date'),
        ),
        migrations.AlterField(
            model_name='payment',
            name='reservation_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='bookings.reservation', verbose_name='Reservation'),
        ),
        migrations.AlterField(
            model_name='payment',
            name='status',
            field=models.CharField(choices=[('P', 'Pending'), ('PA', 'Paid'), ('F', 'Failed')], default='P', max_length=2, verbose_name='Status'),
        ),
        migrations.AlterField(
            model_name='payment',
            name='stripe_payment_id',
            field=models.TextField(verbose_name='Stripe Payment ID'),
        ),
        migrations.AlterField(
            model_name='payment',
            name='table_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='bookings.table', verbose_name='Table'),
        ),
        migrations.AlterField(
            model_name='payment',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='User'),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='description',
            field=models.TextField(max_length=50, verbose_name='Description'),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='no_show',
            field=models.BooleanField(default=False, verbose_name='No Show'),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='payment_status',
            field=models.BooleanField(default=False, verbose_name='Payment Status'),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='reservation_date',
            field=models.DateTimeField(verbose_name='Reservation Date'),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='slot_time_id',
            field=models.ForeignKey(default=0, on_delete=django.db.models.deletion.CASCADE, to='bookings.mealslottime', verbose_name='Meal Slot'),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='table_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='bookings.table', verbose_name='Table'),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='user_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='User'),
        ),
        migrations.AlterField(
            model_name='table',
            name='adults',
            field=models.IntegerField(verbose_name='Adults'),
        ),
        migrations.AlterField(
            model_name='table',
            name='children',
            field=models.IntegerField(verbose_name='Children'),
        ),
        migrations.AlterField(
            model_name='table',
            name='is_available',
            field=models.BooleanField(default=True, verbose_name='Available'),
        ),
        migrations.AlterField(
            model_name='table',
            name='table_number',
            field=models.IntegerField(unique=True, verbose_name='Table Number'),
        ),
    ]
