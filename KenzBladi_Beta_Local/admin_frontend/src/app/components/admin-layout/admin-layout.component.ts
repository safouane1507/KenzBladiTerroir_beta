import { Component, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminAuthService } from '../../services/admin-auth.service';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent {
  sidebarOpen = false;

  navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'bi-speedometer2',    route: '/dashboard'      },
    { label: 'Produits',        icon: 'bi-box-seam',         route: '/produits'       },
    { label: 'Taxonomies',      icon: 'bi-tags',             route: '/taxonomies'     },
    { label: 'FAQs',            icon: 'bi-question-circle',  route: '/faqs'           },
    { label: 'Chat Sessions',   icon: 'bi-chat-dots',        route: '/chat-sessions'  }
  ];

  constructor(public auth: AdminAuthService) {}

  get user() { return this.auth.getUser(); }
  get userInitial() { return this.user?.login?.charAt(0)?.toUpperCase() || 'A'; }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar()  { this.sidebarOpen = false; }
  logout()        { this.auth.logout(); }

  @HostListener('document:keydown.escape') onEsc() { this.sidebarOpen = false; }
}
