from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Назва категорії")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')

    def __str__(self):
        return f"{self.name} ({self.user.username})"

class PasswordRecord(models.Model):
    service_name = models.CharField(max_length=255, verbose_name="Назва сервісу (напр. Google)")
    login = models.CharField(max_length=255, verbose_name="Логін або Email")
    encrypted_password = models.CharField(max_length=500, verbose_name="Зашифрований пароль")
    
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Категорія")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='passwords', verbose_name="Власник")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.service_name} - {self.login}"