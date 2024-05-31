import { Injectable, inject } from '@angular/core';
import { NearApiService } from './near-api.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RealEstateService {
  private nearApiService = inject(NearApiService);
  private http = inject(HttpClient);

  private isInitializedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isInitialized$: Observable<boolean> = this.isInitializedSubject.asObservable();

  private isSignedInSubject = new BehaviorSubject<boolean>(false);
  public isSignedIn$ = this.isSignedInSubject.asObservable();

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.nearApiService.isInitialized$.subscribe((initialized) => {
      if (initialized) {
        this.isInitializedSubject.next(true);
        this.nearApiService.isSignedIn$.subscribe((isSignedIn) => {
          this.isSignedInSubject.next(isSignedIn);
        });
      }
    });
  }
  // authorization functions
  signIn() {
    this.nearApiService.signIn();
  }

  signOut() {
    this.nearApiService.signOut();
    window.location.reload();
  }

  isUserSignedIn(): void {
    const isSignedIn = this.nearApiService.isUserSignedIn();
    this.isSignedInSubject.next(isSignedIn);
  }

  // for now add mock data
  getAllProperties(): Observable<any[]> {
    return of([
      {
        title: 'test property1',
        description: 'some long description to test property',
        images: ['https://t4.ftcdn.net/jpg/01/23/68/71/360_F_123687102_3rPakqjpruQ7hV0yImMYcSYBXGkTCwE5.jpg'],
      },
      {
        title: 'test property2',
        description: 'some long description to test property',
        images: ['https://t4.ftcdn.net/jpg/01/23/68/71/360_F_123687102_3rPakqjpruQ7hV0yImMYcSYBXGkTCwE5.jpg'],
      },
    ]);
  }
  getPropertyById(id: string) {}
}
