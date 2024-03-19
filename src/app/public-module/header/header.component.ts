import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isCollapsed = false;

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }
  isScrolled: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Detect if user has scrolled down
    this.isScrolled = window.scrollY > 0;
  }
}
