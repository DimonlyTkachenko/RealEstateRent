import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { RealEstateService } from '../../services/real-estate.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private realEstateService = inject(RealEstateService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  isInitialized = false;
  isSignedIn: boolean;

  constructor() {}

  ngOnInit(): void {
    /*
      As initialization comes from Near service, we need to wait for it to finish
      and only then get info about user login
    */
    this.realEstateService.isInitialized$.subscribe((initialized) => {
      this.isInitialized = initialized;
    });
    this.realEstateService.isSignedIn$.subscribe((isSignedIn) => {
      this.isSignedIn = isSignedIn;
    });
  }

  signIn() {
    this.realEstateService.signIn();
  }
  signOut() {
    const isToSignOut = confirm('You really want to sign out?');
    if (isToSignOut) {
      this.realEstateService.signOut();
    }
  }

  toggleUiTheme() {
    this.themeService.toggleTheme();
  }
}
