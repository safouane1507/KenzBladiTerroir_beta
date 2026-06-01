import { Routes } from '@angular/router';
import { adminAuthGuard } from './guards/admin-auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'produits',
        loadComponent: () => import('./pages/produits-list/produits-list.component').then(m => m.ProduitsListComponent)
      },
      {
        path: 'produits/new',
        loadComponent: () => import('./pages/produit-form/produit-form.component').then(m => m.ProduitFormComponent)
      },
      {
        path: 'produits/:ref',
        loadComponent: () => import('./pages/produit-form/produit-form.component').then(m => m.ProduitFormComponent)
      },
      {
        path: 'taxonomies',
        loadComponent: () => import('./pages/taxonomies/taxonomies.component').then(m => m.TaxonomiesComponent)
      },
      {
        path: 'faqs',
        loadComponent: () => import('./pages/faqs/faqs.component').then(m => m.FaqsComponent)
      },
      {
        path: 'chat-sessions',
        loadComponent: () => import('./pages/chat-sessions/chat-sessions.component').then(m => m.ChatSessionsComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
