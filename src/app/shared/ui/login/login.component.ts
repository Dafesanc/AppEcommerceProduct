import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../../models/auth.models';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loading = false;
  errorMessage = '';
  showPassword = false;
  emailFocused = false;
  passwordFocused = false;

  formLogin!: FormGroup;

  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.formLogin = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  iniciarSesion(): void {
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    const loginData: LoginRequest = {
      email: this.formLogin.value.email,
      password: this.formLogin.value.password
    };

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(loginData).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Credenciales inválidas. Intenta de nuevo.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  switchToRegister(): void {
    this.router.navigate(['/register']);
  }

  forgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  get emailControl() { return this.formLogin.get('email'); }
  get passwordControl() { return this.formLogin.get('password'); }

  onFieldFocus(field: string): void {
    if (field === 'email') this.emailFocused = true;
    if (field === 'password') this.passwordFocused = true;
  }

  onFieldBlur(field: string): void {
    if (field === 'email') this.emailFocused = false;
    if (field === 'password') this.passwordFocused = false;
  }
}
