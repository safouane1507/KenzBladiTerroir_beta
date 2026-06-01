import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './faqs.component.html'
})
export class FaqsComponent implements OnInit {
  faqs: any[] = [];
  loading = true;
  showForm = false;
  editing: any = null;
  expandedId: string | null = null;

  model: any = {
    titre: { fr: '', ar: '', en: '' },
    etatObjet: 'code-1',
    questions: []
  };

  constructor(private api: AdminApiService, private toast: MessageService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getFaqs().subscribe({
      next: data => { this.faqs = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openNew() {
    this.editing = null;
    this.model = { titre: { fr: '', ar: '', en: '' }, etatObjet: 'code-1', questions: [] };
    this.showForm = true;
  }

  openEdit(f: any) {
    this.editing = f;
    this.model = {
      titre: { fr: f.titre?.fr || '', ar: f.titre?.ar || '', en: f.titre?.en || '' },
      etatObjet: f.etatObjet || 'code-1',
      questions: (f.questions || []).map((q: any) => ({
        question: { fr: q.question?.fr || '', ar: q.question?.ar || '' },
        reponse:  { fr: q.reponse?.fr  || '', ar: q.reponse?.ar  || '' }
      }))
    };
    this.showForm = true;
  }

  addQuestion() {
    this.model.questions.push({ question: { fr: '', ar: '' }, reponse: { fr: '', ar: '' } });
  }

  removeQuestion(i: number) { this.model.questions.splice(i, 1); }

  cancel() { this.showForm = false; this.editing = null; }

  save() {
    const req = this.editing
      ? this.api.updateFaq(this.editing.id || this.editing._id, this.model)
      : this.api.createFaq(this.model);

    req.subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Enregistré', detail: this.editing ? 'FAQ mise à jour' : 'FAQ créée', life: 2500 });
        this.showForm = false;
        this.load();
      },
      error: err => this.toast.add({ severity: 'error', summary: 'Erreur', detail: err?.error?.message || 'Échec', life: 3000 })
    });
  }

  confirmDelete(f: any) {
    if (!confirm(`Supprimer "${f.titre?.fr}" ?`)) return;
    this.api.deleteFaq(f.id || f._id).subscribe({
      next: () => {
        this.faqs = this.faqs.filter(x => (x.id || x._id) !== (f.id || f._id));
        this.toast.add({ severity: 'success', summary: 'Supprimé', detail: 'FAQ supprimée', life: 2500 });
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Suppression échouée', life: 3000 })
    });
  }

  toggleExpand(id: string) {
    this.expandedId = this.expandedId === id ? null : id;
  }
}
