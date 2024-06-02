import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { RealEstateService } from './services/real-estate.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private realEstateService = inject(RealEstateService);

  constructor() {}

  async canActivate(): Promise<boolean> {
    const isLoggedIn = await this.realEstateService.isUserSignedIn();
    //console.log('@Authguard: ' + isLoggedIn);
    if (isLoggedIn) {
      return true;
    } else {
      // show ui modal
      this.realEstateService.signIn();
      //this.router.navigate(['/login']);
      return false;
    }
  }
}
