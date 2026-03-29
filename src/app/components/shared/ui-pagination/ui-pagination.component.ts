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
  currentPage = input.required<number>();

  hasNextPage = input.required<boolean>();

  prevLabel = input<string>('Anterior');
  nextLabel = input<string>('Siguiente');

  pageChanged = output<number>();

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
