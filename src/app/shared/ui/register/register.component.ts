import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../../models/auth.models';

interface Country {
  name: string;
  code: string;
  prefix: string;
  flag: string;
}

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  formRegister!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  countries: Country[] = [
    { name: 'Ecuador', code: 'EC', prefix: '+593', flag: '🇪🇨' },
    { name: 'Colombia', code: 'CO', prefix: '+57', flag: '🇨🇴' },
    { name: 'México', code: 'MX', prefix: '+52', flag: '🇲🇽' },
    { name: 'Argentina', code: 'AR', prefix: '+54', flag: '🇦🇷' },
    { name: 'Chile', code: 'CL', prefix: '+56', flag: '🇨🇱' },
    { name: 'Perú', code: 'PE', prefix: '+51', flag: '🇵🇪' },
    { name: 'Venezuela', code: 'VE', prefix: '+58', flag: '🇻🇪' },
    { name: 'España', code: 'ES', prefix: '+34', flag: '🇪🇸' },
    { name: 'USA', code: 'US', prefix: '+1', flag: '🇺🇸' },
  ];

  firstNameFocused = false;
  lastNameFocused = false;
  emailFocused = false;
  passwordFocused = false;
  confirmPasswordFocused = false;
  phoneFocused = false;

  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.formRegister = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      country: [this.countries[0], Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
      role: ['CUSTOMER', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (!password || !confirmPassword) return null;
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  registrarse(): void {
    if (this.formRegister.invalid) {
      this.formRegister.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos correctamente';
      return;
    }

    const phone = this.formRegister.value.country.prefix + this.formRegister.value.phone;
    const data: RegisterRequest = {
      firstName: this.formRegister.value.firstName,
      lastName: this.formRegister.value.lastName,
      email: this.formRegister.value.email,
      password: this.formRegister.value.password,
      phone,
      role: this.formRegister.value.role
    };

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(data).subscribe({
      next: () => {
        this.successMessage = '¡Registro exitoso! Redirigiendo...';
        setTimeout(() => this.router.navigate(['/home']), 1500);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al registrarse. Intenta de nuevo.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  switchToLogin(): void {
    this.router.navigate(['/login']);
  }

  togglePassword(): void { this.showPassword = !this.showPassword; }
  toggleConfirmPassword(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  get firstNameControl() { return this.formRegister.get('firstName'); }
  get lastNameControl() { return this.formRegister.get('lastName'); }
  get emailControl() { return this.formRegister.get('email'); }
  get passwordControl() { return this.formRegister.get('password'); }
  get confirmPasswordControl() { return this.formRegister.get('confirmPassword'); }
  get phoneControl() { return this.formRegister.get('phone'); }
  get countryControl() { return this.formRegister.get('country'); }

  onFieldFocus(field: string): void {
    (this as any)[`${field}Focused`] = true;
  }

  onFieldBlur(field: string): void {
    (this as any)[`${field}Focused`] = false;
  }
}
