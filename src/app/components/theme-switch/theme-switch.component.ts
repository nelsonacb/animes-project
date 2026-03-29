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
  private themeService = inject(ThemeService);
  private platformId = inject(PLATFORM_ID);

  isDarkMode = signal(false);

  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  @Input() showIcon: boolean = true;

  @Input() showLabel: boolean = false;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isDarkMode.set(this.themeService.isDarkMode());
    }
  }

  onToggle(): void {
    this.themeService.toggleTheme();

    this.isDarkMode.set(this.themeService.isDarkMode());
  }

  getIcon(): string {
    return this.isDarkMode() ? 'dark_mode' : 'light_mode';
  }

  getSizeClasses(): string {
    const sizeMap = {
      small: 'scale-75',
      medium: 'scale-100',
      large: 'scale-125',
    };
    return sizeMap[this.size];
  }
}
