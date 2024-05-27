import { Component, OnInit } from '@angular/core';
import { RealEstateService } from '../../services/real-estate.service';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  isInitialized = false;
  isSignedIn: boolean;

  constructor(
    private realEstateService: RealEstateService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.realEstateService.isInitialized$.subscribe((initialized) => {
      this.isInitialized = initialized;
      if (initialized) {
        this.isSignedIn = this.realEstateService.isUserSignedIn();
      }
    });
  }

  signIn() {
    this.realEstateService.signIn();
  }
  signOut() {
    const isToSignOut = confirm('You really want to sign out?');
    if (isToSignOut) {
      this.realEstateService.signOut();
      this.isSignedIn = false;
    }
  }

  toggleUiTheme() {
    this.themeService.toggleTheme();
  }
}
