import { Injectable, inject } from '@angular/core';
import { NearApiService, CONTRACT_ID } from './near-api.service';
import { BehaviorSubject, Observable, from } from 'rxjs';
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

  isUserSignedIn(): boolean {
    const isSignedIn = this.nearApiService.isUserSignedIn();
    this.isSignedInSubject.next(isSignedIn);
    return isSignedIn;
  }

  getAllProperties(): Observable<any[]> {
    return from(this.nearApiService.viewMethod(CONTRACT_ID, 'getAllAvailableProperties'));
  }

  createNewProperty(object: { [prop: string]: any }): void {
    const accountId = this.nearApiService.accountId;
    console.log(JSON.stringify({ owner: accountId, ...object }));
 //   debugger;
    this.nearApiService.callMethod({
      contractId: CONTRACT_ID,
      method: 'addProperty',
      args: { owner: accountId, ...object },
    });
  }

  getUserProperties(): Observable<any[]> {
    const accountId = this.nearApiService.accountId;
    return from(this.nearApiService.viewMethod(CONTRACT_ID, 'getPropertiesByAccount', { accountId }));
  }

  getPropertyById(id: string) {}
}
