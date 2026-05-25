import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './shared/ui/login/login.component';
import { RegisterComponent } from './shared/ui/register/register.component';
import { NotfoundComponent } from './shared/ui/notfound/notfound.component';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { ProductoComponent } from './pages/producto/producto.component';
import { guestGuard, authGuard, adminGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'producto/:id', component: ProductoComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  // Rutas protegidas (se añadirán los componentes en siguientes pasos)
  { path: 'carrito', loadComponent: () => import('./pages/carrito/carrito.component').then(m => m.CarritoComponent), canActivate: [authGuard] },
  { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent), canActivate: [authGuard] },
  { path: 'mis-pedidos', loadComponent: () => import('./pages/mis-pedidos/mis-pedidos.component').then(m => m.MisPedidosComponent), canActivate: [authGuard] },
  { path: 'perfil', loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent), canActivate: [authGuard] },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent), canActivate: [authGuard, adminGuard] },
  { path: 'not-found', component: NotfoundComponent },
  { path: '**', redirectTo: 'not-found' }
];
