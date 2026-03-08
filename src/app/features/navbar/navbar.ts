import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faHouse,
  faBell,
  faBars,
  faUser,
  faGear,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, FaIconComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly router = inject(Router);

  faHouse = faHouse;
  faBell = faBell;
  faBars = faBars;
  faUser = faUser;
  faGear = faGear;
  faRightFromBracket = faRightFromBracket;

  isDropdownOpen: boolean = false;

  // TODO: replace with real user data from your auth/user service
  userName: string = 'Yousef Abbas';
  userPhoto: string = 'https://i.pravatar.cc/150?img=3';

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-navbar')) {
      this.isDropdownOpen = false;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isDropdownOpen = false;
    this.router.navigate(['/login']);
  }
}