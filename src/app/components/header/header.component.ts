import { Component, OnInit } from '@angular/core';
import { RealEstateService } from '../../services/real-estate.service';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule],
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
    this.realEstateService.signOut();
    this.isSignedIn = false;
  }

  toggleUiTheme() {
    this.themeService.toggleTheme();
  }
}
