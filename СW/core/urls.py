from django.contrib import admin
from django.urls import path
from manager import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home_view, name='home'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('save-password/', views.save_password_view, name='save_password'),
    path('passwords/', views.passwords_view, name='passwords'),
    path('check/', views.check_view, name='check'),
    path('profile/', views.profile_view, name='profile'),
    path('about/', views.about_view, name='about'),
    path('admin-panel/', views.custom_admin_view, name='custom_admin'),
]
