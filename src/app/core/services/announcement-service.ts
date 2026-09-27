import { Injectable, signal } from '@angular/core';
import { Announcement } from '../models/models';

const KEY = 'arise_announcements';

@Injectable({ providedIn: 'root' })
export class AnnouncementService {

  announcements = signal<Announcement[]>(this.load());

  private load(): Announcement[] {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private save(list: Announcement[]) {
    localStorage.setItem(KEY, JSON.stringify(list));
    this.announcements.set(list);
  }

  post(message: string) {
    const entry: Announcement = { id: crypto.randomUUID(), message, createdAt: new Date().toISOString() };
    this.save([entry, ...this.announcements()]);
  }

  remove(id: string) {
    this.save(this.announcements().filter(a => a.id !== id));
  }

  latest(count = 5): Announcement[] {
    return this.announcements().slice(0, count);
  }
}
