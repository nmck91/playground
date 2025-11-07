import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { ChartDataService } from './services/chart-data.service';
import { SupabaseService } from './services/supabase.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [ChartDataService, SupabaseService],
    }).compileComponents();
  });

  it('should create the app component', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
