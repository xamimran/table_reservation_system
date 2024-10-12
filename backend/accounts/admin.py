from django.contrib import admin
from accounts import models as account_models



# @admin.register(account_models.User)
# class UserAdmin(admin.ModelAdmin):

#     model = account_models.User
#     list_display = ['first_name', 'last_name', 'email', 'phone', 'user_notes']
#     list_filter = ["is_staff", "is_active"]
#     search_fields = ["email"]
#     exclude = ('is_staff', "is_active", "date_joined", "last_login", "password", "groups", "user_permissions", "is_superuser") 
