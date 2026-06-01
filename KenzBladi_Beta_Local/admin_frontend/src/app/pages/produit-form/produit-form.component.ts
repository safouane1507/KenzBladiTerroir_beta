import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-produit-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ToastModule],
  providers: [MessageService],
  templateUrl: './produit-form.component.html'
})
export class ProduitFormComponent implements OnInit {
  isNew = true;
  loading = false;
  saving = false;
  ref = '';

  model: any = {
    refProduit: '', classe: '', etatObjet: 'code-1',
    designation: { fr: '', ar: '', en: '' },
    slogan: { fr: '', ar: '', en: '' },
    description: { fr: '', ar: '', en: '' },
    prixHT: 0, tva: 20, stock: 0,
    region: [], tags: [], certifications: [],
    caracteristiques: {},
    images: []
  };

  tagsInput = '';
  regionsInput = '';
  certificationsInput = '';
  caracKeys: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: AdminApiService,
    private toast: MessageService
  ) {}

  ngOnInit() {
    this.ref = this.route.snapshot.paramMap.get('ref') || '';
    this.isNew = !this.ref || this.ref === 'new';
    if (!this.isNew) this.loadProduit();
  }

  loadProduit() {
    this.loading = true;
    this.api.getProduit(this.ref).subscribe({
      next: p => {
        this.model = {
          ...p,
          designation: p.designation || { fr: '', ar: '', en: '' },
          slogan:      p.slogan      || { fr: '', ar: '', en: '' },
          description: p.description || { fr: '', ar: '', en: '' },
          caracteristiques: p.caracteristiques || {},
          region: p.region || [],
          tags:   p.tags   || [],
          certifications: p.certifications || [],
          images: p.images || []
        };
        this.tagsInput   = (this.model.tags || []).join(', ');
        this.regionsInput = (this.model.region || []).join(', ');
        this.certificationsInput = (this.model.certifications || []).join(', ');
        this.caracKeys = Object.keys(this.model.caracteristiques);
        this.loading = false;
      },
      error: () => { this.loading = false; this.router.navigate(['/produits']); }
    });
  }

  get prixTTC(): number {
    return +(this.model.prixHT * (1 + (this.model.tva || 0) / 100)).toFixed(2);
  }

  addCaracKey() {
    const k = prompt('Nom de la caractéristique (ex: Poids, Couleur):');
    if (k && k.trim() && !this.caracKeys.includes(k.trim())) {
      this.caracKeys.push(k.trim());
      this.model.caracteristiques[k.trim()] = '';
    }
  }

  removeCaracKey(k: string) {
    this.caracKeys = this.caracKeys.filter(x => x !== k);
    delete this.model.caracteristiques[k];
  }

  save() {
    this.saving = true;
    const payload = {
      ...this.model,
      tags:           this.tagsInput.split(',').map((s: string) => s.trim()).filter(Boolean),
      region:         this.regionsInput.split(',').map((s: string) => s.trim()).filter(Boolean),
      certifications: this.certificationsInput.split(',').map((s: string) => s.trim()).filter(Boolean)
    };

    const req = this.isNew
      ? this.api.createProduit(payload)
      : this.api.updateProduit(this.ref, payload);

    req.subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Enregistré', detail: this.isNew ? 'Produit créé' : 'Produit mis à jour', life: 2500 });
        setTimeout(() => this.router.navigate(['/produits']), 1200);
      },
      error: err => {
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: err?.error?.message || 'Sauvegarde échouée', life: 3500 });
        this.saving = false;
      }
    });
  }
}
