import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  public isCollapsed: boolean = false;
  public isLoggedIn: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage?.getItem('google_auth')) {
        this.isLoggedIn = true;
      }
    }
  }

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
