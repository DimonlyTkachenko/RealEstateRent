import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { RealEstateService } from '../../services/real-estate.service';

@Component({
  selector: 'app-user-properties-list',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, RouterOutlet],
  templateUrl: './user-properties-list.component.html',
  styleUrl: './user-properties-list.component.scss',
})
export class UserPropertiesListComponent {
  private realEstateService = inject(RealEstateService);
  userProperties: any[];
  isInitialized = false;
  isSignedIn: boolean;

  ngOnInit(): void {
    this.realEstateService.isInitialized$.subscribe((initialized) => {
      this.isInitialized = initialized;
    });
    this.realEstateService.isSignedIn$.subscribe((isSignedIn) => {
      this.isSignedIn = isSignedIn;
    });
    this.realEstateService.getUserProperties().subscribe((data) => {
      console.log(data);
      this.userProperties = data;
    });
  }
}
