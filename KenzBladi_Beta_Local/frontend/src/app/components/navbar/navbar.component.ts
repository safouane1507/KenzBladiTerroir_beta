import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  mobileOpen = false;

  constructor(public themeService: ThemeService) {}

  toggleTheme(): void { this.themeService.toggleTheme(); }
  toggleMobile(): void { this.mobileOpen = !this.mobileOpen; }
}
