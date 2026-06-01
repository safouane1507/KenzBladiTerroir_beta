import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ChatbotService } from '../../services/chatbot.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  produit: any = null;
  loading = true;
  notFound = false;
  selectedImage = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private chatService: ChatbotService
  ) {}

  ngOnInit(): void {
    const ref = this.route.snapshot.paramMap.get('ref') || '';
    this.productService.getProduit(ref).subscribe({
      next: p => {
        this.produit = p;
        this.selectedImage = this.productService.getImageUrl(p.imageProduit);
        this.loading = false;
      },
      error: () => { this.notFound = true; this.loading = false; }
    });
  }

  get fr(): any { return this.productService.getFrTranslation(this.produit); }
  get priceTTC(): number { return this.productService.getPriceTTC(this.produit); }
  get priceHT(): number  { return this.produit?.tarifUHTPardefaut || 0; }
  get tva(): number      { return this.produit?.tvaParDefaut ?? 20; }
  get stockClass(): string { return this.productService.getStockClass(this.produit); }

  askKenza(): void {
    this.chatService.openWithProduct(this.produit.refProduit);
  }
}
