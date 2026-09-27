import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);

  hunterName = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = signal<string | null>(null);

  submit() {
    this.error.set(null);

    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters.');
      return;
    }

    const result = this.auth.register(this.email, this.password, this.hunterName);

    if (!result.ok) {
      this.error.set(result.error ?? 'Registration failed.');
      return;
    }

    this.router.navigate(['/dashboard']);
  }
}
