import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarLayoutComponent } from './layout/sidebar-layout.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarLayoutComponent, CommonModule],
  template: `
    <div *ngIf="authService.isAuthenticated$ | async; else loginPage">
      <app-sidebar-layout>
        <router-outlet></router-outlet>
      </app-sidebar-layout>
    </div>
    
    <ng-template #loginPage>
      <router-outlet></router-outlet>
    </ng-template>
  `
})
export class AppComponent {
  title = 'GeoConseil - Système de Suivi et Évaluation';
  authService = inject(AuthService);
}