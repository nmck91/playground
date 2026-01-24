import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  name: string;
  isLoggedIn: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    this.loadUser();
  }

  private loadUser(): void {
    const stored = localStorage.getItem('family_reward_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        this.userSubject.next(user);
      } catch {
        this.logout();
      }
    }
  }

  login(name: string): void {
    const user: User = {
      id: `user_${Date.now()}`,
      name,
      isLoggedIn: true
    };
    localStorage.setItem('family_reward_user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem('family_reward_user');
    this.userSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.userSubject.value?.isLoggedIn || false;
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  loginAsParent(): void {
    this.login('Parent');
  }

  loginAsChild(): void {
    this.login('Child');
  }
}
