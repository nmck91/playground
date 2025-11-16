import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RewardsModalComponent } from './rewards-modal.component';
import { Reward } from '../../models/reward.model';

describe('RewardsModalComponent', () => {
  let component: RewardsModalComponent;
  let fixture: ComponentFixture<RewardsModalComponent>;

  const mockKidsRewards: Reward[] = [
    { name: 'Reward 1', stars: 20 },
    { name: 'Reward 2', stars: 25 },
    { name: 'Reward 3', stars: 30 }
  ];

  const mockParentsRewards: Reward[] = [
    { name: 'Parent Reward 1', stars: 15 },
    { name: 'Parent Reward 2', stars: 20 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RewardsModalComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(RewardsModalComponent);
    component = fixture.componentInstance;
    component.kidsRewards = [...mockKidsRewards];
    component.parentsRewards = [...mockParentsRewards];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Modal Visibility', () => {
    it('should be hidden by default', () => {
      expect(component.visible).toBe(false);
    });

    it('should show when visible is true', () => {
      component.visible = true;
      fixture.detectChanges();
      const modal = fixture.nativeElement.querySelector('[role="dialog"]');
      expect(modal.classList.contains('hidden')).toBe(false);
    });
  });

  describe('Close Modal', () => {
    it('should emit closeModal event', () => {
      jest.spyOn(component.closeModal, 'emit');
      component.onClose();
      expect(component.closeModal.emit).toHaveBeenCalled();
    });

    it('should reset editing state on close', () => {
      component.editingReward = { reward: mockKidsRewards[0], index: 0, type: 'kids' };
      component.onClose();
      expect(component.editingReward).toBeNull();
    });

    it('should reset adding state on close', () => {
      component.addingReward = { type: 'kids' };
      component.newReward = { name: 'Test', stars: 20 };
      component.onClose();
      expect(component.addingReward).toBeNull();
      expect(component.newReward).toEqual({ name: '', stars: 20 });
    });
  });

  describe('Edit Reward', () => {
    it('should start edit mode', () => {
      const reward = mockKidsRewards[0];
      component.startEdit(reward, 0, 'kids');

      expect(component.editingReward).toBeTruthy();
      expect(component.editingReward?.reward.name).toBe(reward.name);
      expect(component.editingReward?.index).toBe(0);
      expect(component.editingReward?.type).toBe('kids');
    });

    it('should cancel edit', () => {
      component.editingReward = { reward: mockKidsRewards[0], index: 0, type: 'kids' };
      component.cancelEdit();
      expect(component.editingReward).toBeNull();
    });

    it('should save edit and emit updateReward', () => {
      jest.spyOn(component.updateReward, 'emit');
      component.editingReward = {
        reward: { name: 'Updated Reward', stars: 35 },
        index: 0,
        type: 'kids'
      };

      component.saveEdit();

      expect(component.updateReward.emit).toHaveBeenCalledWith({
        type: 'kids',
        index: 0,
        reward: { name: 'Updated Reward', stars: 35 }
      });
      expect(component.editingReward).toBeNull();
    });

    it('should not save edit if name is empty', () => {
      jest.spyOn(component.updateReward, 'emit');
      component.editingReward = {
        reward: { name: '  ', stars: 35 },
        index: 0,
        type: 'kids'
      };

      component.saveEdit();

      expect(component.updateReward.emit).not.toHaveBeenCalled();
    });

    it('should not save edit if stars is 0 or negative', () => {
      jest.spyOn(component.updateReward, 'emit');
      component.editingReward = {
        reward: { name: 'Test', stars: 0 },
        index: 0,
        type: 'kids'
      };

      component.saveEdit();

      expect(component.updateReward.emit).not.toHaveBeenCalled();
    });
  });

  describe('Delete Reward', () => {
    it('should emit deleteReward when confirmed', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      jest.spyOn(component.deleteReward, 'emit');

      component.deleteRewardItem(0, 'kids');

      expect(component.deleteReward.emit).toHaveBeenCalledWith({
        type: 'kids',
        index: 0
      });
    });

    it('should not emit deleteReward when cancelled', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(false);
      jest.spyOn(component.deleteReward, 'emit');

      component.deleteRewardItem(0, 'kids');

      expect(component.deleteReward.emit).not.toHaveBeenCalled();
    });
  });

  describe('Add Reward', () => {
    it('should start add mode', () => {
      component.startAdd('kids');

      expect(component.addingReward).toEqual({ type: 'kids' });
      expect(component.newReward).toEqual({ name: '', stars: 20 });
    });

    it('should cancel add', () => {
      component.addingReward = { type: 'kids' };
      component.newReward = { name: 'Test', stars: 25 };

      component.cancelAdd();

      expect(component.addingReward).toBeNull();
      expect(component.newReward).toEqual({ name: '', stars: 20 });
    });

    it('should save add and emit addReward', () => {
      jest.spyOn(component.addReward, 'emit');
      component.addingReward = { type: 'parents' };
      component.newReward = { name: 'New Parent Reward', stars: 40 };

      component.saveAdd();

      expect(component.addReward.emit).toHaveBeenCalledWith({
        type: 'parents',
        reward: { name: 'New Parent Reward', stars: 40 }
      });
      expect(component.addingReward).toBeNull();
    });

    it('should not save add if name is empty', () => {
      jest.spyOn(component.addReward, 'emit');
      component.addingReward = { type: 'kids' };
      component.newReward = { name: '  ', stars: 20 };

      component.saveAdd();

      expect(component.addReward.emit).not.toHaveBeenCalled();
    });

    it('should not save add if stars is invalid', () => {
      jest.spyOn(component.addReward, 'emit');
      component.addingReward = { type: 'kids' };
      component.newReward = { name: 'Test', stars: -5 };

      component.saveAdd();

      expect(component.addReward.emit).not.toHaveBeenCalled();
    });
  });

  describe('Helper Methods', () => {
    it('should track by index', () => {
      const result = component.trackByIndex(5);
      expect(result).toBe(5);
    });

    it('should check if editing', () => {
      component.editingReward = { reward: mockKidsRewards[0], index: 1, type: 'kids' };

      expect(component.isEditing(1, 'kids')).toBe(true);
      expect(component.isEditing(0, 'kids')).toBe(false);
      expect(component.isEditing(1, 'parents')).toBe(false);
    });
  });
});
