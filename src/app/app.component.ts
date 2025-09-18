import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/ui/header/header.component';
import { FooterComponent } from './shared/ui/footer/footer.component';
import { FlowbiteService } from './shared/services/flowbite.service';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'signal-store';
  private flowbiteService = inject(FlowbiteService);

  ngOnInit(): void {
    // Initialize the application
    this.startFlowbite();
  }

  startFlowbite() {
    this.flowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
      console.log('Flowbite initialized for SSR', flowbite);
    });
  }
}
