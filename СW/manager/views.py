from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import update_session_auth_hash

def register_view(request):
    error_message = None
    if request.method == 'POST':
        user_name = request.POST.get('username')
        email = request.POST.get('email')
        pass1 = request.POST.get('password')
        pass2 = request.POST.get('password_confirm')

        if pass1 != pass2:
            error_message = "Паролі не співпадають!"
        elif User.objects.filter(username=user_name).exists():
            error_message = "Користувач з таким логіном вже існує!"
        else:
            user = User.objects.create_user(username=user_name, email=email, password=pass1)
            user.save()
            login(request, user)
            return redirect('home')

    return render(request, 'manager/register.html', {'error': error_message})

def login_view(request):
    error_message = None
    if request.method == 'POST':
        user_name = request.POST.get('username')
        pass1 = request.POST.get('password')

        user = authenticate(request, username=user_name, password=pass1)
        
        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            error_message = "Невірний логін або пароль!"

    return render(request, 'manager/login.html', {'error': error_message})

def home_view(request):
    return render(request, 'manager/home.html')

def logout_view(request):
    logout(request)
    return redirect('login')
from django.contrib.auth.decorators import login_required
from .models import PasswordRecord

@login_required(login_url='login')
def save_password_view(request):
    generated_pwd = request.GET.get('pwd', '')
    
    if request.method == 'POST':
        service = request.POST.get('service_name')
        login_val = request.POST.get('login')
        password_val = request.POST.get('password')
        
        PasswordRecord.objects.create(
            user=request.user,
            service_name=service,
            login=login_val,
            encrypted_password=password_val
        )
        return redirect('passwords')
        
    return render(request, 'manager/save_password.html', {'pwd': generated_pwd})

@login_required(login_url='login')
def passwords_view(request):
    records = PasswordRecord.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'manager/passwords.html', {'records': records})
@login_required(login_url='login')
def check_view(request):
    return render(request, 'manager/check.html')

from django.contrib.auth import update_session_auth_hash

@login_required(login_url='login')
def profile_view(request):
    saved_count = PasswordRecord.objects.filter(user=request.user).count()
    success_msg = None
    error_msg = None

    if request.method == 'POST':
        if 'update_profile' in request.POST:
            new_username = request.POST.get('username')
            new_email = request.POST.get('email')
            
            if User.objects.filter(username=new_username).exclude(id=request.user.id).exists():
                error_msg = "Цей логін вже зайнятий іншим користувачем!"
            else:
                request.user.username = new_username
                request.user.email = new_email
                request.user.save()
                success_msg = "Особисті дані успішно оновлено!"
                
        elif 'change_password' in request.POST:
            new_pass1 = request.POST.get('new_password')
            new_pass2 = request.POST.get('confirm_password')
            
            if new_pass1 == new_pass2:
                request.user.set_password(new_pass1)
                request.user.save()
                update_session_auth_hash(request, request.user)
                success_msg = "Пароль від акаунта успішно змінено!"
            else:
                error_msg = "Нові паролі не співпадають!"

    return render(request, 'manager/profile.html', {
        'saved_count': saved_count,
        'success_msg': success_msg,
        'error_msg': error_msg
    })

def about_view(request):
    return render(request, 'manager/about.html')
@login_required(login_url='login')
def custom_admin_view(request):
    if not request.user.is_superuser:
        return redirect('home')

    success_msg = None
    
    if request.method == 'POST':
        user_id = request.POST.get('user_id')
        action = request.POST.get('action')
        target_user = User.objects.get(id=user_id)
        
        if action == 'update_email':
            target_user.email = request.POST.get('new_email')
            target_user.save()
            success_msg = f"Пошту для користувача {target_user.username} оновлено!"
            
        elif action == 'update_password':
            target_user.set_password(request.POST.get('new_password'))
            target_user.save()
            success_msg = f"Пароль для користувача {target_user.username} успішно змінено!"

    users = User.objects.exclude(id=request.user.id).order_by('-date_joined')
    
    return render(request, 'manager/custom_admin.html', {
        'users': users,
        'success_msg': success_msg
    })