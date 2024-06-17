import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  public isCollapsed: boolean = false;
  public isLoggedIn:any;
  ngOnInit(): void {
    if (localStorage?.getItem('google_auth')) {
      
      this.isLoggedIn = true;
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
