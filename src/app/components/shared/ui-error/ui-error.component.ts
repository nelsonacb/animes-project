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
  // ═══════════════════════════════════════════════════════════════
  // SIGNAL INPUTS - Configuración del error
  // ═══════════════════════════════════════════════════════════════

  // Mensaje de error (requerido)
  message = input.required<string>();

  // ¿Mostrar botón de reintentar? (por defecto true)
  showRetry = input<boolean>(true);

  // Texto personalizado para el botón
  retryLabel = input<string>('Reintentar');

  // Ícono personalizado (opcional)
  icon = input<string>('error_outline');

  // ═══════════════════════════════════════════════════════════════
  // SIGNAL OUTPUTS - Eventos
  // ═══════════════════════════════════════════════════════════════

  // Evento cuando se hace click en reintentar
  retry = output<void>();

  // ═══════════════════════════════════════════════════════════════
  // MÉTODOS
  // ═══════════════════════════════════════════════════════════════

  onRetry(): void {
    this.retry.emit();
  }

  getAnimeUIErrorClasses(): string {
    return this.themeService.isDarkMode()
      ? 'text-white' // Dark mode
      : 'text-gray-900'; // Light mode
  }
}
