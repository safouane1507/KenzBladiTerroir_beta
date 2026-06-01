import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, AccordionModule],
  templateUrl: './faq.component.html'
})
export class FaqComponent implements OnInit {
  faqs: any[] = [];
  loading = true;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getFaqs().subscribe({
      next: f => { this.faqs = f; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getFr(item: any): any {
    return item?.translations?.find((t: any) => t.language === 'fr') || {};
  }

  getQFr(q: any): any {
    return q?.translations?.find((t: any) => t.language === 'fr') || {};
  }
}
