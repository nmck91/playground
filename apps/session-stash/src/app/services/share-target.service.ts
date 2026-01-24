import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthState } from '../state/auth.state';

const PENDING_SHARE_KEY = 'session-stash-pending-share';

interface PendingShare {
  url: string;
  title?: string;
}

@Injectable({ providedIn: 'root' })
export class ShareTargetService {
  private router = inject(Router);
  private authState = inject(AuthState);

  /**
   * Handle incoming share - called from ShareHandlerComponent
   */
  handleIncomingShare(url: string | null, title: string | null): void {
    if (!url) {
      this.router.navigate(['/drills']);
      return;
    }

    if (this.authState.isAuthenticated()) {
      this.navigateToAddForm(url, title);
    } else {
      this.storePendingShare({ url, title: title ?? undefined });
      this.router.navigate(['/login']);
    }
  }

  /**
   * Check and process pending share - called after successful login
   */
  processPendingShare(): void {
    const pending = this.getPendingShare();
    if (pending) {
      this.clearPendingShare();
      this.navigateToAddForm(pending.url, pending.title ?? null);
    }
  }

  private navigateToAddForm(url: string, title: string | null): void {
    this.router.navigate(['/drills', 'add'], {
      queryParams: { url, ...(title && { title }) },
    });
  }

  private storePendingShare(share: PendingShare): void {
    localStorage.setItem(PENDING_SHARE_KEY, JSON.stringify(share));
  }

  private getPendingShare(): PendingShare | null {
    const stored = localStorage.getItem(PENDING_SHARE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private clearPendingShare(): void {
    localStorage.removeItem(PENDING_SHARE_KEY);
  }
}
