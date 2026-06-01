import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ChatbotWidgetComponent } from './components/chatbot-widget/chatbot-widget.component';
import { ThemeService } from './services/theme.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, NavbarComponent, FooterComponent, ChatbotWidgetComponent],
  template: `
    <app-navbar></app-navbar>
    <main style="min-height: calc(100vh - 144px);">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <app-chatbot-widget></app-chatbot-widget>
    <a href="http://localhost:4201" target="_blank" class="admin-shortcut">
      <i class="pi pi-cog"></i> Admin
    </a>
  `
})
export class AppComponent implements OnInit {
  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.initTheme();
  }
}
