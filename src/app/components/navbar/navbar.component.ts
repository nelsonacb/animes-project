import { Component, inject, signal, effect, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { ThemeSwitchComponent } from '../theme-switch/theme-switch.component';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatMenuModule,
    ThemeSwitchComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);

  private storage = inject(StorageService);

  isDarkMode = signal(false);
  isMobileMenuOpen = signal(false);

  menuItems = [
    { label: 'Home', icon: 'home', route: '/' },
    { label: 'Search', icon: 'search', route: '/search' },
    { label: 'Seasons', icon: 'calendar_today', route: '/season/2025/fall' },
    { label: 'Genres', icon: 'local_fire_department', route: '/genres' },
    { label: 'Favorites', icon: 'favorite', route: '/favorites' },
  ];

  ngAfterViewInit(): void {
    // ✅ Verificación extra de seguridad (opcional, el servicio ya protege)
    if (isPlatformBrowser(this.platformId)) {
      this.loadTheme();

      effect(() => {
        this.applyTheme(this.isDarkMode());
        // ✅ Usar storage.setItem en lugar de localStorage.setItem
        this.storage.setItem('theme', this.isDarkMode() ? 'dark' : 'light');
      });
    }
  }

  private loadTheme(): void {
    // ✅ Usar storage.getItem en lugar de localStorage.getItem
    const savedTheme = this.storage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      this.isDarkMode.set(true);
    }
  }

  private applyTheme(isDark: boolean): void {
    // ✅ document sigue necesitando protección (no está en el servicio)
    if (typeof document === 'undefined') return;

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleTheme(): void {
    this.isDarkMode.update((current) => !current);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((current) => !current);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  goToRandom(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = '/random';
    }
  }
}
