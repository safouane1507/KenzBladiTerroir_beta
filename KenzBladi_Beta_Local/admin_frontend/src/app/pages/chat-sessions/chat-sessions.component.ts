import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-chat-sessions',
  standalone: true,
  imports: [CommonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './chat-sessions.component.html'
})
export class ChatSessionsComponent implements OnInit {
  sessions: any[] = [];
  loading = true;
  activeSession: any = null;
  activeMessages: any[] = [];
  loadingMessages = false;

  constructor(private api: AdminApiService, private toast: MessageService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getChatSessions().subscribe({
      next: data => { this.sessions = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openSession(s: any) {
    if (this.activeSession?.sessionId === s.sessionId) {
      this.activeSession = null;
      this.activeMessages = [];
      return;
    }
    this.activeSession = s;
    this.loadingMessages = true;
    this.api.getChatSession(s.sessionId).subscribe({
      next: msgs => { this.activeMessages = msgs; this.loadingMessages = false; },
      error: () => { this.loadingMessages = false; }
    });
  }

  confirmDelete(s: any) {
    if (!confirm(`Supprimer la session ${s.sessionId} ?`)) return;
    this.api.deleteChatSession(s.sessionId).subscribe({
      next: () => {
        this.sessions = this.sessions.filter(x => x.sessionId !== s.sessionId);
        if (this.activeSession?.sessionId === s.sessionId) {
          this.activeSession = null;
          this.activeMessages = [];
        }
        this.toast.add({ severity: 'success', summary: 'Supprimé', detail: 'Session supprimée', life: 2500 });
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Suppression échouée', life: 3000 })
    });
  }

  confirmClearAll() {
    if (!confirm('Supprimer TOUTES les sessions de chat ? Cette action est irréversible.')) return;
    this.api.clearAllChats().subscribe({
      next: () => {
        this.sessions = [];
        this.activeSession = null;
        this.activeMessages = [];
        this.toast.add({ severity: 'success', summary: 'Effacé', detail: 'Toutes les sessions supprimées', life: 2500 });
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Opération échouée', life: 3000 })
    });
  }

  agentColor(agent: string): string {
    const map: Record<string, string> = {
      navigation: '#17a2b8',
      specialist:  'var(--primary-color)',
      general:     'var(--secondary-color)',
      unknown:     '#6c757d'
    };
    return map[agent] || '#6c757d';
  }
}
