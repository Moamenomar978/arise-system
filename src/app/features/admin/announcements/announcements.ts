import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AnnouncementService } from '../../../core/services/announcement-service';

@Component({
  imports: [FormsModule, DatePipe],
  selector: 'app-announcements',
  styleUrl: './announcements.css',
  templateUrl: './announcements.html',
})
export class Announcements {
  announcementService = inject(AnnouncementService);

  message = '';

  post() {
    if (!this.message.trim()) return;
    this.announcementService.post(this.message.trim());
    this.message = '';
  }

  remove(id: string) {
    this.announcementService.remove(id);
  }
}
