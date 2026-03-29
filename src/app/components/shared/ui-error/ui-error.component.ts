import { Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-ui-error',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './ui-error.component.html',
  styleUrls: ['./ui-error.component.css'],
})
export class UiErrorComponent {
  private themeService = inject(ThemeService);

  message = input.required<string>();

  showRetry = input<boolean>(true);

  retryLabel = input<string>('Reintentar');

  icon = input<string>('error_outline');

  retry = output<void>();

  onRetry(): void {
    this.retry.emit();
  }

  getAnimeUIErrorClasses(): string {
    return this.themeService.isDarkMode()
      ? 'text-white' // Dark mode
      : 'text-gray-900'; // Light mode
  }
}
