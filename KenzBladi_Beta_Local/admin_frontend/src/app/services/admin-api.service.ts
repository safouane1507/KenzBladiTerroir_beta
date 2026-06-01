import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AdminAuthService } from './admin-auth.service';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AdminAuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ 'admin-token': this.auth.getToken() || '' });
  }

  // Dashboard
  getStats() {
    return this.http.get<any>(`${this.base}/admin/dashboard/stats`, { headers: this.headers() });
  }

  // Produits
  getProduits(params: Record<string, any> = {}) {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== '') p = p.set(k, v); });
    return this.http.get<any>(`${this.base}/admin/produits`, { headers: this.headers(), params: p });
  }

  getProduit(ref: string) {
    return this.http.get<any>(`${this.base}/admin/produits/${ref}`, { headers: this.headers() });
  }

  createProduit(data: any) {
    return this.http.post<any>(`${this.base}/admin/produits`, data, { headers: this.headers() });
  }

  updateProduit(ref: string, data: any) {
    return this.http.patch<any>(`${this.base}/admin/produits/${ref}`, data, { headers: this.headers() });
  }

  deleteProduit(ref: string) {
    return this.http.delete<any>(`${this.base}/admin/produits/${ref}`, { headers: this.headers() });
  }

  // Taxonomies
  getTaxonomies() {
    return this.http.get<any[]>(`${this.base}/admin/taxonomies`, { headers: this.headers() });
  }

  createTaxonomy(data: any) {
    return this.http.post<any>(`${this.base}/admin/taxonomies`, data, { headers: this.headers() });
  }

  updateTaxonomy(ref: string, data: any) {
    return this.http.patch<any>(`${this.base}/admin/taxonomies/${ref}`, data, { headers: this.headers() });
  }

  deleteTaxonomy(ref: string) {
    return this.http.delete<any>(`${this.base}/admin/taxonomies/${ref}`, { headers: this.headers() });
  }

  // FAQs
  getFaqs() {
    return this.http.get<any[]>(`${this.base}/admin/faqs`, { headers: this.headers() });
  }

  createFaq(data: any) {
    return this.http.post<any>(`${this.base}/admin/faqs`, data, { headers: this.headers() });
  }

  updateFaq(id: string, data: any) {
    return this.http.patch<any>(`${this.base}/admin/faqs/${id}`, data, { headers: this.headers() });
  }

  deleteFaq(id: string) {
    return this.http.delete<any>(`${this.base}/admin/faqs/${id}`, { headers: this.headers() });
  }

  // Chat sessions
  getChatSessions() {
    return this.http.get<any[]>(`${this.base}/admin/chat`, { headers: this.headers() });
  }

  getChatSession(sessionId: string) {
    return this.http.get<any>(`${this.base}/admin/chat/${sessionId}`, { headers: this.headers() });
  }

  deleteChatSession(sessionId: string) {
    return this.http.delete<any>(`${this.base}/admin/chat/${sessionId}`, { headers: this.headers() });
  }

  clearAllChats() {
    return this.http.delete<any>(`${this.base}/admin/chat`, { headers: this.headers() });
  }
}
