import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ThemeService } from '../app/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('animes-project');
  private themeService = inject(ThemeService);

  getMainClasses(): string {
    return this.themeService.isDarkMode()
      ? 'min-h-screen bg-gray-900 transition-colors' // Dark mode
      : 'min-h-screen bg-gray-50 transition-colors'; // Light mode
  }
}
