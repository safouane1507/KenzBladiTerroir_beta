import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ChartModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  loading = true;

  categoryChartData: any;
  categoryChartOptions: any;
  stockChartData: any;
  stockChartOptions: any;

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.api.getStats().subscribe({
      next: data => {
        this.stats = data;
        this.buildCharts(data);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private buildCharts(data: any) {
    const docStyle = getComputedStyle(document.documentElement);
    const textColor = docStyle.getPropertyValue('--text-color').trim() || '#333';
    const textMuted = docStyle.getPropertyValue('--text-secondary-color').trim() || '#888';
    const border    = docStyle.getPropertyValue('--surface-border').trim() || '#e2e8f0';

    // Category breakdown bar chart
    const cats = data.categoryBreakdown || [];
    this.categoryChartData = {
      labels: cats.map((c: any) => c.label),
      datasets: [{
        label: 'Produits',
        data: cats.map((c: any) => c.count),
        backgroundColor: 'rgba(51,51,5,.75)',
        borderRadius: 6
      }]
    };
    this.categoryChartOptions = {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textMuted }, grid: { color: border } },
        y: { ticks: { color: textMuted, stepSize: 1 }, grid: { color: border } }
      }
    };

    // Stock breakdown doughnut chart
    const stock = data.stockBreakdown || {};
    this.stockChartData = {
      labels: ['En stock', 'Stock faible', 'Rupture'],
      datasets: [{
        data: [stock.enStock || 0, stock.faible || 0, stock.rupture || 0],
        backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
        hoverOffset: 4
      }]
    };
    this.stockChartOptions = {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor } } }
    };
  }
}
