import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ui-pagination',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './ui-pagination.component.html',
  styleUrls: ['./ui-pagination.component.css'],
})
export class UiPaginationComponent {
  // ═══════════════════════════════════════════════════════════════
  // SIGNAL INPUTS (Angular 17+) - Más limpios que @Input()
  // ═══════════════════════════════════════════════════════════════

  // Página actual (requerido)
  currentPage = input.required<number>();

  // ¿Hay página siguiente? (requerido)
  hasNextPage = input.required<boolean>();

  // Label personalizado para botones (opcional)
  prevLabel = input<string>('Anterior');
  nextLabel = input<string>('Siguiente');

  // ═══════════════════════════════════════════════════════════════
  // SIGNAL OUTPUTS - Eventos que emite el componente
  // ═══════════════════════════════════════════════════════════════

  // Evento cuando se cambia de página
  pageChanged = output<number>();

  // ═══════════════════════════════════════════════════════════════
  // MÉTODOS
  // ═══════════════════════════════════════════════════════════════

  goToPrevious(): void {
    const current = this.currentPage();
    if (current > 1) {
      this.pageChanged.emit(current - 1);
    }
  }

  goToNext(): void {
    if (this.hasNextPage()) {
      this.pageChanged.emit(this.currentPage() + 1);
    }
  }
}
