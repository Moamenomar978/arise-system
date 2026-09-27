import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-admin-layout',
  styleUrl: './admin-layout.css',
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  auth = inject(AuthService);
  private router = inject(Router);

  user = this.auth.currentUser;

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
