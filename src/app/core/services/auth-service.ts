import { Injectable, signal } from '@angular/core';
import { AppUser } from '../models/models';
import { Role } from '../models/enums';

const USERS_KEY = 'arise_users';
const SESSION_KEY = 'arise_session';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // NOTE: there is no backend here — users, passwords and sessions all live
  // in localStorage. This is fine for a frontend demo of "the System" but is
  // NOT secure and should never be treated as real auth.

  currentUser = signal<AppUser | null>(this.restoreSession());

  private restoreSession(): AppUser | null {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    return this.getUsers().find(u => u.id === id) ?? null;
  }

  getUsers(): AppUser[] {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveUsers(users: AppUser[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  register(email: string, password: string, hunterName: string): { ok: boolean; error?: string } {
    const users = this.getUsers();

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'An account with that email already exists.' };
    }

    // First hunter to ever register becomes the Admin — convenient for a
    // frontend-only demo where there's no seeded backend account.
    const role = users.length === 0 ? Role.ADMIN : Role.USER;

    const user: AppUser = {
      id: crypto.randomUUID(),
      email,
      password,
      hunterName: hunterName || email.split('@')[0],
      role,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    this.saveUsers(users);
    this.startSession(user);
    return { ok: true };
  }

  login(email: string, password: string): { ok: boolean; error?: string } {
    const user = this.getUsers().find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) return { ok: false, error: 'Invalid email or password.' };
    if (user.banned) return { ok: false, error: 'This hunter account has been suspended.' };

    this.startSession(user);
    return { ok: true };
  }

  logout() {
    localStorage.removeItem(SESSION_KEY);
    this.currentUser.set(null);
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === Role.ADMIN;
  }

  updateUser(updated: AppUser) {
    const users = this.getUsers().map(u => (u.id === updated.id ? updated : u));
    this.saveUsers(users);
    if (this.currentUser()?.id === updated.id) {
      this.currentUser.set(updated);
    }
  }

  deleteUser(userId: string) {
    this.saveUsers(this.getUsers().filter(u => u.id !== userId));
  }

  private startSession(user: AppUser) {
    localStorage.setItem(SESSION_KEY, user.id);
    this.currentUser.set(user);
  }
}
