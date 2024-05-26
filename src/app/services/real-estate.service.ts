import { Injectable } from '@angular/core';
import { NearApiService } from './near-api.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RealEstateService {
  private isInitializedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isInitialized$: Observable<boolean> = this.isInitializedSubject.asObservable();


  constructor(private nearApiService: NearApiService) {
    this.initialize();
  }

  private initialize() {
    this.nearApiService.isInitialized$.subscribe(initialized => {
      if (initialized) {
        this.isInitializedSubject.next(true);
      }
    });
  }

  signIn() {
    this.nearApiService.signIn();
  }

  signOut() {
    this.nearApiService.signOut();
  }

  isUserSignedIn(): boolean{
    return this.nearApiService.isUserSignedIn();
  }
}
