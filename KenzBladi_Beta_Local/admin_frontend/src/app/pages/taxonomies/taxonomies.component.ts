import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-taxonomies',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './taxonomies.component.html'
})
export class TaxonomiesComponent implements OnInit {
  taxonomies: any[] = [];
  loading = true;
  showForm = false;
  editing: any = null;

  model = { reference: '', label: { fr: '', ar: '', en: '' }, description: { fr: '' }, etatObjet: 'code-1' };

  constructor(private api: AdminApiService, private toast: MessageService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getTaxonomies().subscribe({
      next: data => { this.taxonomies = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openNew() {
    this.editing = null;
    this.model = { reference: '', label: { fr: '', ar: '', en: '' }, description: { fr: '' }, etatObjet: 'code-1' };
    this.showForm = true;
  }

  openEdit(t: any) {
    this.editing = t;
    this.model = {
      reference: t.reference,
      label: { fr: t.label?.fr || '', ar: t.label?.ar || '', en: t.label?.en || '' },
      description: { fr: t.description?.fr || '' },
      etatObjet: t.etatObjet || 'code-1'
    };
    this.showForm = true;
  }

  cancel() { this.showForm = false; this.editing = null; }

  save() {
    const req = this.editing
      ? this.api.updateTaxonomy(this.editing.reference, this.model)
      : this.api.createTaxonomy(this.model);

    req.subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Enregistré', detail: this.editing ? 'Taxonomie mise à jour' : 'Taxonomie créée', life: 2500 });
        this.showForm = false;
        this.load();
      },
      error: err => this.toast.add({ severity: 'error', summary: 'Erreur', detail: err?.error?.message || 'Échec', life: 3000 })
    });
  }

  confirmDelete(t: any) {
    if (!confirm(`Supprimer "${t.label?.fr || t.reference}" ?`)) return;
    this.api.deleteTaxonomy(t.reference).subscribe({
      next: () => {
        this.taxonomies = this.taxonomies.filter(x => x.reference !== t.reference);
        this.toast.add({ severity: 'success', summary: 'Supprimé', detail: 'Taxonomie supprimée', life: 2500 });
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Suppression échouée', life: 3000 })
    });
  }
}
