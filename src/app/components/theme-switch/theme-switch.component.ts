import { Component, inject, OnInit, PLATFORM_ID, signal, Input } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-switch',
  standalone: true,
  imports: [CommonModule, MatSlideToggleModule, MatIconModule, MatButtonModule],
  templateUrl: './theme-switch.component.html',
  styleUrls: ['./theme-switch.component.css'],
})
export class ThemeSwitchComponent implements OnInit {
  // ═════════════════════════════════════════════════════════════
  // 1. INYECCIÓN DE DEPENDENCIAS
  // ═════════════════════════════════════════════════════════════
  private themeService = inject(ThemeService);
  private platformId = inject(PLATFORM_ID);

  // ═════════════════════════════════════════════════════════════
  // 2. SIGNALS PARA ESTADO LOCAL
  // ═════════════════════════════════════════════════════════════
  // Signal local que se sincroniza con el servicio
  isDarkMode = signal(false);

  // ═════════════════════════════════════════════════════════════
  // 3. INPUTS OPCIONALES PARA PERSONALIZACIÓN
  // ═════════════════════════════════════════════════════════════
  // Tamaño: 'small' | 'medium' | 'large'
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  // Mostrar ícono dentro del toggle
  @Input() showIcon: boolean = true;

  // Mostrar label de texto
  @Input() showLabel: boolean = false;

  ngOnInit(): void {
    // Solo inicializar en navegador
    if (isPlatformBrowser(this.platformId)) {
      // Sincronizar estado inicial con el servicio
      this.isDarkMode.set(this.themeService.isDarkMode());
    }
  }

  // ═════════════════════════════════════════════════════════════
  // 4. MÉTODO: TOGGLE DEL TEMA
  // ═════════════════════════════════════════════════════════════
  onToggle(): void {
    // Llamar al servicio para cambiar tema globalmente
    this.themeService.toggleTheme();

    // Actualizar signal local para UI reactiva
    this.isDarkMode.set(this.themeService.isDarkMode());
  }

  // ═════════════════════════════════════════════════════════════
  // 5. MÉTODO: OBTENER ÍCONO SEGÚN TEMA
  // ═════════════════════════════════════════════════════════════
  getIcon(): string {
    return this.isDarkMode() ? 'dark_mode' : 'light_mode';
  }

  // ═════════════════════════════════════════════════════════════
  // 6. MÉTODO: OBTENER CLASES DE TAMAÑO
  // ═════════════════════════════════════════════════════════════
  getSizeClasses(): string {
    const sizeMap = {
      small: 'scale-75',
      medium: 'scale-100',
      large: 'scale-125',
    };
    return sizeMap[this.size];
  }
}
