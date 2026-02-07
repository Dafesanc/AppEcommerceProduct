import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

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
    { name: 'Colombia', code: 'CO', prefix: '+57', flag: '🇨🇴' },
    { name: 'México', code: 'MX', prefix: '+52', flag: '🇲🇽' },
    { name: 'Argentina', code: 'AR', prefix: '+54', flag: '🇦🇷' },
    { name: 'Chile', code: 'CL', prefix: '+56', flag: '🇨🇱' },
    { name: 'Perú', code: 'PE', prefix: '+51', flag: '🇵🇪' },
    { name: 'Venezuela', code: 'VE', prefix: '+58', flag: '🇻🇪' },
    { name: 'Ecuador', code: 'EC', prefix: '+593', flag: '🇪🇨' },
    { name: 'España', code: 'ES', prefix: '+34', flag: '🇪🇸' },
    { name: 'USA', code: 'US', prefix: '+1', flag: '🇺🇸' },
    { name: 'Canadá', code: 'CA', prefix: '+1', flag: '🇨🇦' }
  ];

  // Focus tracking
  firstNameFocused = false;
  lastNameFocused = false;
  emailFocused = false;
  passwordFocused = false;
  confirmPasswordFocused = false;
  phoneFocused = false;

  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  ngOnInit(): void {
    this.formRegister = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      country: [this.countries[0], Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator for password matching
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  registrarse() {
    if (this.formRegister.invalid) {
      this.formRegister.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos correctamente';
      return;
    }

    const phoneWithPrefix = this.formRegister.value.country.prefix + this.formRegister.value.phone;

    const registrationData = {
      firstName: this.formRegister.value.firstName,
      lastName: this.formRegister.value.lastName,
      email: this.formRegister.value.email,
      password: this.formRegister.value.password,
      phone: phoneWithPrefix
    };

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Simular registro exitoso
    setTimeout(() => {
      this.loading = false;
      this.successMessage = '¡Registro exitoso! Redirigiendo al inicio de sesión...';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }, 1500);

    console.log('Datos de registro:', registrationData);
  }

  switchToLogin() {
    this.router.navigate(['/login']);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Convenience getters
  get firstNameControl() { return this.formRegister.get('firstName'); }
  get lastNameControl() { return this.formRegister.get('lastName'); }
  get emailControl() { return this.formRegister.get('email'); }
  get passwordControl() { return this.formRegister.get('password'); }
  get confirmPasswordControl() { return this.formRegister.get('confirmPassword'); }
  get phoneControl() { return this.formRegister.get('phone'); }
  get countryControl() { return this.formRegister.get('country'); }

  onFieldFocus(field: string) {
    if (field === 'firstName') this.firstNameFocused = true;
    if (field === 'lastName') this.lastNameFocused = true;
    if (field === 'email') this.emailFocused = true;
    if (field === 'password') this.passwordFocused = true;
    if (field === 'confirmPassword') this.confirmPasswordFocused = true;
    if (field === 'phone') this.phoneFocused = true;
  }

  onFieldBlur(field: string) {
    if (field === 'firstName') this.firstNameFocused = false;
    if (field === 'lastName') this.lastNameFocused = false;
    if (field === 'email') this.emailFocused = false;
    if (field === 'password') this.passwordFocused = false;
    if (field === 'confirmPassword') this.confirmPasswordFocused = false;
    if (field === 'phone') this.phoneFocused = false;
  }
}
