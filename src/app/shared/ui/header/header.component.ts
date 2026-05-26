import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  private notificationsService = inject(NotificationsService);
  private router = inject(Router);

  isMenuOpen = signal(false);
  isUserMenuOpen = signal(false);

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.cart.load();
      this.notificationsService.connect();
    }
  }

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  goToCart(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/carrito']);
  }

  logout(): void {
    this.cart.clear();
    this.notificationsService.disconnect();
    this.auth.logout();
    this.isUserMenuOpen.set(false);
  }

  get userName(): string {
    const u = this.auth.currentUser();
    return u ? u.firstName : '';
  }
}
