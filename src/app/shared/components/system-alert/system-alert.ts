import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification-service';

@Component({
  imports: [],
  selector: 'app-system-alert',
  styleUrl: './system-alert.css',
  templateUrl: './system-alert.html',
})
export class SystemAlert {
  notify = inject(NotificationService);

  dismiss(id: number) {
    this.notify.dismiss(id);
  }
}
