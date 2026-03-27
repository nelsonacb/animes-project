import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-ui-loading',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatProgressSpinnerModule],
  templateUrl: './ui-loading.component.html',
  styleUrls: ['./ui-loading.component.css'],
})
export class UiLoadingComponent {
  // ═══════════════════════════════════════════════════════════════
  // SIGNAL INPUTS - Configuración del loader
  // ═══════════════════════════════════════════════════════════════

  // ¿Mostrar el loader? (por defecto true)
  show = input<boolean>(true);

  // Mensaje personalizado (opcional)
  message = input<string>('Loading...');

  // Tamaño del spinner: 'small' | 'medium' | 'large'
  size = input<'small' | 'medium' | 'large'>('medium');

  // Modo de la barra de progreso: 'indeterminate' | 'determinate'
  progressMode = input<'indeterminate' | 'determinate'>('indeterminate');

  // Valor de progreso (solo si progressMode='determinate')
  progressValue = input<number>(0);

  // ═══════════════════════════════════════════════════════════════
  // MÉTODO HELPER: Obtener tamaño del spinner
  // ═══════════════════════════════════════════════════════════════

  getSpinnerDiameter(): number {
    const sizes = { small: 30, medium: 40, large: 60 };
    return sizes[this.size()];
  }
}
