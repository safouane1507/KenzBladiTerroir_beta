import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatbotService, ChatMessage } from '../../services/chatbot.service';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.component.html'
})
export class ChatbotWidgetComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isOpen = false;
  messages: ChatMessage[] = [];
  inputText = '';
  isLoading = false;
  private subs: Subscription[] = [];
  private pendingRef: string | null = null;
  private shouldScroll = false;

  constructor(private chatService: ChatbotService) {}

  ngOnInit(): void {
    this.subs.push(
      this.chatService.isOpen$.subscribe(open => {
        this.isOpen = open;
        if (open && this.messages.length === 0) this.addWelcome();
      }),
      this.chatService.messages$.subscribe(msgs => {
        this.messages = msgs;
        this.shouldScroll = true;
      }),
      this.chatService.pendingRef$.subscribe(ref => {
        this.pendingRef = ref;
        if (ref && this.isOpen) this.sendPendingRef();
      })
    );
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  toggle(): void { this.chatService.toggleOpen(); }
  close(): void  { this.chatService.close(); }

  send(): void {
    const msg = this.inputText.trim();
    if (!msg || this.isLoading) return;
    this.inputText = '';
    this.dispatchMessage(msg);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); this.send(); }
  }

  private addWelcome(): void {
    this.chatService.addMessage({
      role: 'assistant',
      content: 'Ahlan wa sahlan ! 👋 Je suis **Kenza**, votre assistante Kenz Bladi. Comment puis-je vous aider ?',
      agent: 'WELCOME',
      timestamp: new Date()
    });
  }

  private sendPendingRef(): void {
    if (!this.pendingRef) return;
    const ref = this.pendingRef;
    this.pendingRef = null;
    const msg = `Pouvez-vous me donner plus d'informations sur le produit ref: ${ref} ?`;
    this.dispatchMessage(msg, ref);
  }

  private dispatchMessage(text: string, productRef?: string): void {
    this.chatService.addMessage({ role: 'user', content: text, timestamp: new Date() });
    this.isLoading = true;

    this.chatService.sendMessage(text, productRef).subscribe({
      next: (res: any) => {
        if (res.sessionId) this.chatService.setSessionId(res.sessionId);
        this.chatService.addMessage({
          role: 'assistant',
          content: res.reply,
          agent: res.agent,
          timestamp: new Date()
        });
        this.isLoading = false;
      },
      error: () => {
        this.chatService.addMessage({
          role: 'assistant',
          content: 'Désolée, je rencontre une difficulté technique. Vérifiez qu\'Ollama est lancé.',
          agent: 'ERROR',
          timestamp: new Date()
        });
        this.isLoading = false;
      }
    });
  }

  private scrollToBottom(): void {
    try { this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight; }
    catch {}
  }

  agentLabel(agent?: string): string {
    const map: Record<string, string> = {
      SPECIALIST: '🔍 SPÉCIALISTE', NAVIGATION: '🗺 NAVIGATION',
      GENERAL: '📋 GÉNÉRAL', ERROR: '⚠ ERREUR', WELCOME: ''
    };
    return map[agent || ''] ?? '';
  }
}
