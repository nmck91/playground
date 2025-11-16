import { TestBed } from '@angular/core/testing';
import { ChartDataService } from './chart-data.service';
import { SupabaseService } from './supabase.service';
import { Reward } from '../models/reward.model';

describe('ChartDataService', () => {
  let service: ChartDataService;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;

  beforeEach(() => {
    // Create mock Supabase service
    mockSupabaseService = {
      isInitialized: jest.fn().mockReturnValue(false),
      loadFamilyMembers: jest.fn().mockResolvedValue([]),
      loadStarCompletions: jest.fn().mockResolvedValue([]),
      saveStarCompletion: jest.fn().mockResolvedValue(undefined),
      resetWeek: jest.fn().mockResolvedValue(undefined),
      ensureFamilyMembersExist: jest.fn().mockResolvedValue([])
    } as any;

    TestBed.configureTestingModule({
      providers: [
        ChartDataService,
        { provide: SupabaseService, useValue: mockSupabaseService }
      ]
    });
    service = TestBed.inject(ChartDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Reward Management', () => {
    describe('addReward', () => {
      it('should add a kid reward and sort by stars', (done) => {
        const newReward: Reward = { name: 'Test Reward', stars: 15 };

        service.chartData$.subscribe(data => {
          if (data.kidsRewards.some(r => r.name === 'Test Reward')) {
            expect(data.kidsRewards).toContain(newReward);
            // Check sorting - 15 stars should be before 20 star rewards
            const rewardIndex = data.kidsRewards.findIndex(r => r.name === 'Test Reward');
            const nextReward = data.kidsRewards[rewardIndex + 1];
            if (nextReward) {
              expect(nextReward.stars).toBeGreaterThanOrEqual(15);
            }
            done();
          }
        });

        service.addReward('kids', newReward);
      });

      it('should add a parent reward and sort by stars', (done) => {
        const newReward: Reward = { name: 'Parent Test Reward', stars: 22 };

        service.chartData$.subscribe(data => {
          if (data.parentsRewards.some(r => r.name === 'Parent Test Reward')) {
            expect(data.parentsRewards).toContain(newReward);
            const rewardIndex = data.parentsRewards.findIndex(r => r.name === 'Parent Test Reward');
            const nextReward = data.parentsRewards[rewardIndex + 1];
            if (nextReward) {
              expect(nextReward.stars).toBeGreaterThanOrEqual(22);
            }
            done();
          }
        });

        service.addReward('parents', newReward);
      });
    });

    describe('updateReward', () => {
      it('should update a kid reward', (done) => {
        const updatedReward: Reward = { name: 'Updated Reward', stars: 50 };

        service.chartData$.subscribe(data => {
          const firstReward = data.kidsRewards[0];
          if (firstReward.name === 'Updated Reward') {
            expect(firstReward.stars).toBe(50);
            done();
          }
        });

        service.updateReward('kids', 0, updatedReward);
      });

      it('should update a parent reward', (done) => {
        const updatedReward: Reward = { name: 'Updated Parent Reward', stars: 40 };

        service.chartData$.subscribe(data => {
          const firstReward = data.parentsRewards[0];
          if (firstReward.name === 'Updated Parent Reward') {
            expect(firstReward.stars).toBe(40);
            done();
          }
        });

        service.updateReward('parents', 0, updatedReward);
      });
    });

    describe('deleteReward', () => {
      it('should delete a kid reward', (done) => {
        let initialLength = 0;

        service.chartData$.subscribe(data => {
          if (initialLength === 0) {
            initialLength = data.kidsRewards.length;
            service.deleteReward('kids', 0);
          } else {
            expect(data.kidsRewards.length).toBe(initialLength - 1);
            done();
          }
        });
      });

      it('should delete a parent reward', (done) => {
        let initialLength = 0;

        service.chartData$.subscribe(data => {
          if (initialLength === 0) {
            initialLength = data.parentsRewards.length;
            service.deleteReward('parents', 0);
          } else {
            expect(data.parentsRewards.length).toBe(initialLength - 1);
            done();
          }
        });
      });
    });
  });

  describe('Star Tracking', () => {
    it('should toggle star completion', async () => {
      await service.toggleStar('kids', 0, 0, 0);
      const data = service['chartDataSubject'].value;
      expect(data.kidsStars[0][0][0]).toBe(true);

      await service.toggleStar('kids', 0, 0, 0);
      const data2 = service['chartDataSubject'].value;
      expect(data2.kidsStars[0][0][0]).toBe(false);
    });

    it('should calculate total stars correctly', () => {
      service['chartDataSubject'].value.kidsStars[0][0] = [true, true, false, false, false, false, false];
      service['chartDataSubject'].value.kidsStars[0][1] = [true, true, true, false, false, false, false];

      const total = service.calculateTotalStars('kids', 0);
      expect(total).toBe(5);
    });

    it('should get next milestone correctly', () => {
      const data = service['chartDataSubject'].value;
      const nextMilestone = service.getNextMilestone(18, false);
      expect(nextMilestone).toBeGreaterThan(18);
    });
  });

  describe('Reset Week', () => {
    it('should reset all stars', async () => {
      // Set some stars
      service['chartDataSubject'].value.kidsStars[0][0] = [true, true, true, false, false, false, false];

      await service.resetWeek();

      const data = service['chartDataSubject'].value;
      // Check all stars are false
      Object.values(data.kidsStars).forEach(habits => {
        Object.values(habits).forEach(days => {
          expect(days.every(day => day === false)).toBe(true);
        });
      });
    });

    it('should call supabase resetWeek when initialized', async () => {
      mockSupabaseService.isInitialized = jest.fn().mockReturnValue(true);
      mockSupabaseService.resetWeek = jest.fn().mockResolvedValue(undefined);

      await service.resetWeek();

      expect(mockSupabaseService.resetWeek).toHaveBeenCalled();
    });
  });

  describe('Week Display', () => {
    it('should return current week display', () => {
      const weekDisplay = service.getCurrentWeekDisplay();
      expect(weekDisplay).toContain('Week of');
      expect(weekDisplay).toMatch(/\d{4}/); // Contains year
    });
  });

  describe('Children Names', () => {
    it('should update children names', (done) => {
      const newNames = ['Child1', 'Child2', 'Child3'];

      service.chartData$.subscribe(data => {
        if (data.children[0].name === 'Child1') {
          expect(data.children[0].name).toBe('Child1');
          expect(data.children[1].name).toBe('Child2');
          expect(data.children[2].name).toBe('Child3');
          done();
        }
      });

      service.updateChildrenNames(newNames);
    });
  });

  describe('Parents Visibility', () => {
    it('should toggle parents visibility', (done) => {
      let initialVisibility = false;

      service.chartData$.subscribe(data => {
        if (initialVisibility === false && data.parentsVisible === true) {
          initialVisibility = true;
        } else if (initialVisibility === true && data.parentsVisible === false) {
          done();
        }
      });

      service.toggleParentsVisibility();
      setTimeout(() => service.toggleParentsVisibility(), 10);
    });
  });
});
