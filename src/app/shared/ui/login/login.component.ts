import { CommonModule } from '@angular/common';
import { Component, inject, OnInit} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Login } from '../../../models/Login';
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  rememberMe = false;
  loading = false;
  errorMessage = '';
  showPassword = false;

  ngOnInit(): void {
    console.log('LoginComponent: ngOnInit called');
    this.formLogin = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }
  constructor() {
    console.log('LoginComponent: Constructor called');
  }
  emailFocused = false;
  passwordFocused = false;

  public formLogin!: FormGroup;

  private router = inject(Router); // Injecting Router for navigation
  private formBuilder = inject(FormBuilder); // Injecting FormBuilder for form handling
  //private authService = inject(AuthService);

  iniciarSesion() {
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched(); // Mark all fields as touched to trigger validation styles
      return;
    }

    const loginData: Login = {
      email: this.formLogin.value.email!,
      password: this.formLogin.value.password!
    };

    this.loading = true;
    this.errorMessage = ''; // Reset error message before making the request
    if(loginData.email !== null && loginData.password !== null)
    {
      this.router.navigate(['home']);
    }
    // this.authService.login(loginData).subscribe({
    //   next: (response) => {
    //     if (response && response.token) {
    //       if (this.formLogin.value.rememberMe) {
    //         localStorage.setItem('token', response.token);
    //       } else {
    //         sessionStorage.setItem('token', response.token);
    //       }
    //       this.router.navigate(['home']);
    //     } else {
    //       this.errorMessage = 'Credenciales inválidas. Por favor, intenta de nuevo.';
    //     }
    //   },
    //   error: (error) => {
    //     this.errorMessage = error.error?.message || 'Error de respuesta del servidor. Por favor, intenta de nuevo más tarde.';
    //     console.error('Error en el inicio de sesión:', error);
    //     this.loading = false;
    //   },
    //   complete: () => {
    //     this.loading = false;
    //   }
    // });
  }
  switchToRegister() {
    this.router.navigate(['register']);
  }

  forgotPassword() {
    // Implement forgot password logic here
    alert('Forgot password functionality is not implemented yet.')
    this.router.navigate(['forgot-password']);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // Convenience getters for easy access to form fields
  get emailControl() { return this.formLogin.get('email'); }
  get passwordControl() { return this.formLogin.get('password'); }

  // Track focus state without using separate variables
  onFieldFocus(field: string) {
    if (field === 'email') this.emailFocused = true;
    if (field === 'password') this.passwordFocused = true;
  }

  onFieldBlur(field: string) {
    if (field === 'email') this.emailFocused = false;
    if (field === 'password') this.passwordFocused = false;
  }

}
