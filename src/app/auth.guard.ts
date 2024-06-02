import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { RealEstateService } from './services/real-estate.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private realEstateService = inject(RealEstateService);
  private router = inject(Router);
  private isSignedIn: boolean;

  constructor() {
    this.realEstateService.isSignedIn$.subscribe((isSignedIn) => {
      this.isSignedIn = isSignedIn;
    });
  }

  async canActivate(): Promise<boolean> {
    if (await this.realEstateService.isUserSignedIn()) {
      return true;
    } else {
      // show ui modal
      this.realEstateService.signIn();
      //this.router.navigate(['/login']);
      return false;
    }
  }
}
