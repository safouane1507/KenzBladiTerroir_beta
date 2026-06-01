import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-produits-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TableModule, ToastModule],
  providers: [MessageService],
  templateUrl: './produits-list.component.html'
})
export class ProduitsListComponent implements OnInit {
  produits: any[] = [];
  total = 0;
  loading = true;

  search = '';
  etatFilter = '';
  page = 1;
  limit = 15;

  constructor(private api: AdminApiService, private toast: MessageService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getProduits({ search: this.search, etatObjet: this.etatFilter, page: this.page, limit: this.limit })
      .subscribe({
        next: res => {
          this.produits = res.data ?? res;
          this.total = res.total ?? this.produits.length;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
  }

  onSearch() { this.page = 1; this.load(); }
  onPageChange(p: number) { this.page = p; this.load(); }

  get totalPages() { return Math.ceil(this.total / this.limit); }
  get pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  toggleEtat(p: any) {
    const next = p.etatObjet === 'code-1' ? 'code-2' : 'code-1';
    this.api.updateProduit(p.refProduit, { etatObjet: next }).subscribe({
      next: () => {
        p.etatObjet = next;
        this.toast.add({ severity: 'success', summary: 'Mis à jour', detail: `Produit ${next === 'code-1' ? 'activé' : 'désactivé'}`, life: 2500 });
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Mise à jour échouée', life: 3000 })
    });
  }

  confirmDelete(p: any) {
    if (!confirm(`Supprimer "${p.designation?.fr || p.refProduit}" ?`)) return;
    this.api.deleteProduit(p.refProduit).subscribe({
      next: () => {
        this.produits = this.produits.filter(x => x.refProduit !== p.refProduit);
        this.total--;
        this.toast.add({ severity: 'success', summary: 'Supprimé', detail: 'Produit supprimé', life: 2500 });
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Suppression échouée', life: 3000 })
    });
  }
}
