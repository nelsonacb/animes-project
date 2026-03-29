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
  show = input<boolean>(true);

  message = input<string>('Loading...');

  size = input<'small' | 'medium' | 'large'>('medium');

  progressMode = input<'indeterminate' | 'determinate'>('indeterminate');

  progressValue = input<number>(0);

  getSpinnerDiameter(): number {
    const sizes = { small: 30, medium: 40, large: 60 };
    return sizes[this.size()];
  }
}
