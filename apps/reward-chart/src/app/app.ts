import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ChartData } from './models/chart-data.model';
import { ChartDataService } from './services/chart-data.service';
import { HeaderComponent } from './components/header/header.component';
import { ChildCardComponent, StarToggleEvent } from './components/child-card/child-card.component';
import { RewardsModalComponent } from './components/rewards-modal/rewards-modal.component';
import { SettingsModalComponent } from './components/settings-modal/settings-modal.component';

@Component({
  imports: [
    CommonModule,
    HeaderComponent,
    ChildCardComponent,
    RewardsModalComponent,
    SettingsModalComponent
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  chartData$!: Observable<ChartData>;
  weekDisplay = '';

  showRewardsModal = false;
  showSettingsModal = false;

  constructor(private chartDataService: ChartDataService) {}

  async ngOnInit(): Promise<void> {
    this.chartData$ = this.chartDataService.chartData$;
    await this.chartDataService.initialize();
    this.weekDisplay = this.chartDataService.getCurrentWeekDisplay();
  }

  onStarToggled(event: StarToggleEvent): void {
    this.chartDataService.toggleStar(
      event.section,
      event.personIndex,
      event.habitIndex,
      event.dayIndex
    );
    this.showCelebration();
  }

  showCelebration(): void {
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    celebration.textContent = '⭐';
    document.body.appendChild(celebration);

    setTimeout(() => {
      document.body.removeChild(celebration);
    }, 600);
  }

  calculateTotalStars(section: 'kids' | 'parents', personIndex: number): number {
    return this.chartDataService.calculateTotalStars(section, personIndex);
  }

  getNextMilestone(stars: number, isParent: boolean): number {
    return this.chartDataService.getNextMilestone(stars, isParent);
  }

  onShowRewards(): void {
    this.showRewardsModal = true;
  }

  onCloseRewards(): void {
    this.showRewardsModal = false;
  }

  onShowSettings(): void {
    this.showSettingsModal = true;
  }

  onCloseSettings(): void {
    this.showSettingsModal = false;
  }

  onSaveSettings(names: string[]): void {
    this.chartDataService.updateChildrenNames(names);
  }

  async onNewWeek(): Promise<void> {
    if (confirm('Are you sure you want to start a new week? This will reset all stars!')) {
      await this.chartDataService.resetWeek();
      this.weekDisplay = this.chartDataService.getCurrentWeekDisplay();
    }
  }

  toggleParentsSection(): void {
    this.chartDataService.toggleParentsVisibility();
  }

  getChildrenNames(chartData: ChartData): string[] {
    return chartData.children.map(c => c.name);
  }
}
