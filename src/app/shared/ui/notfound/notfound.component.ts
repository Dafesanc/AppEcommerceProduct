import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-notfound',
  imports: [],
  templateUrl: './notfound.component.html',
  styleUrl: './notfound.component.css'
})
export class NotfoundComponent {
  private router = inject(Router);
  private location = inject(Location);

  goToHome() {
    this.router.navigate(['/']);
  }

  goBack() {
    this.location.back();
  }
}
