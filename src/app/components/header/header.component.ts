import { Component, OnInit } from '@angular/core';
import { RealEstateService } from '../../services/real-estate.service';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
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

  toggleUiTheme() {
    this.themeService.toggleTheme();
  }
}
