import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './shared/ui/login/login.component';
import { RegisterComponent } from './shared/ui/register/register.component';
import { NotfoundComponent } from './shared/ui/notfound/notfound.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'not-found', component: NotfoundComponent },
  { path: 'home', component: HomeComponent },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: 'not-found' }
];
