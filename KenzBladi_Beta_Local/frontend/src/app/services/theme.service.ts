import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isDark = false;

  initTheme(): void {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      this.isDark = true;
      document.documentElement.classList.add('app-dark');
      this.swapThemeCss(true);
    }
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    document.documentElement.classList.toggle('app-dark', this.isDark);
    this.swapThemeCss(this.isDark);
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
  }

  private swapThemeCss(dark: boolean): void {
    const link = document.getElementById('theme-css') as HTMLLinkElement;
    if (link) {
      link.href = dark
        ? 'assets/themes/lara-dark-blue/theme.css'
        : 'assets/themes/lara-light-blue/theme.css';
    }
  }

  get darkMode(): boolean { return this.isDark; }
}
