import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProduits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/produits`);
  }

  getProduit(ref: string): Observable<any> {
    return this.http.get<any>(`${this.api}/produits/${ref}`);
  }

  getTaxonomies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/taxonomies`);
  }

  getFaqs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/faqs`);
  }

  getPriceTTC(produit: any): number {
    const ht = produit?.tarifUHTPardefaut || 0;
    const tva = produit?.tvaParDefaut ?? 20;
    return parseFloat((ht * (1 + tva / 100)).toFixed(2));
  }

  getImageUrl(imageProduit: string): string {
    if (!imageProduit) return `${environment.imagesUrl}/product.jpg`;
    return `${environment.imagesUrl}/${imageProduit}`;
  }

  getFrTranslation(produit: any): any {
    return produit?.translations?.find((t: any) => t.language === 'fr') || {};
  }

  getStockClass(produit: any): string {
    const qty = produit?.indicationDuStock?.quantiteDisponible ?? 0;
    const etat = produit?.indicationDuStock?.etatStock ?? '';
    if (etat === 'Rupture' || qty === 0) return 'rupture';
    if (qty <= 5) return 'faible';
    return 'en-stock';
  }
}
