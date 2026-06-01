import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private api = environment.apiUrl;
  private sessionId: string | null = null;

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private openSubject = new BehaviorSubject<boolean>(false);
  private pendingRefSubject = new BehaviorSubject<string | null>(null);

  messages$ = this.messagesSubject.asObservable();
  isOpen$ = this.openSubject.asObservable();
  pendingRef$ = this.pendingRefSubject.asObservable();

  constructor(private http: HttpClient) {}

  sendMessage(message: string, productRef?: string): Observable<any> {
    const payload: any = { message, sessionId: this.sessionId };
    if (productRef) payload.productRef = productRef;
    return this.http.post<any>(`${this.api}/chat`, payload);
  }

  setSessionId(id: string): void { this.sessionId = id; }
  getSessionId(): string | null   { return this.sessionId; }

  addMessage(msg: ChatMessage): void {
    const current = this.messagesSubject.getValue();
    this.messagesSubject.next([...current, msg]);
  }

  openWithProduct(ref: string): void {
    this.pendingRefSubject.next(ref);
    this.openSubject.next(true);
  }

  toggleOpen(): void { this.openSubject.next(!this.openSubject.getValue()); }
  close(): void       { this.openSubject.next(false); }

  clearMessages(): void {
    this.messagesSubject.next([]);
    this.sessionId = null;
  }
}
