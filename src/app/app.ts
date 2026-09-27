import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SystemAlert } from './shared/components/system-alert/system-alert';

@Component({
  imports: [RouterOutlet, SystemAlert],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
}
