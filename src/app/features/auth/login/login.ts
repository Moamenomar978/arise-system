import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = signal<string | null>(null);

  submit() {
    this.error.set(null);
    const result = this.auth.login(this.email, this.password);

    if (!result.ok) {
      this.error.set(result.error ?? 'Login failed.');
      return;
    }

    this.router.navigate(['/dashboard']);
  }
}
