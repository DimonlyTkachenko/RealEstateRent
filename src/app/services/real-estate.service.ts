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

  async isUserSignedIn(): Promise<boolean> {
    const isSignedIn = await this.nearApiService.isUserSignedIn();
    this.isSignedInSubject.next(isSignedIn);
    return isSignedIn;
  }

  getAllProperties(): Observable<any[]> {
    return from(this.nearApiService.viewMethod(CONTRACT_ID, 'getAllAvailableProperties'));
  }

  createNewProperty(object: { [prop: string]: any }): void {
    const accountId = this.nearApiService.accountId;
    const args = { owner: accountId, ...object };

    console.log('@createNewProperty: ' + JSON.stringify(args));

    this.nearApiService.callMethod({
      contractId: CONTRACT_ID,
      method: 'addProperty',
      args,
    });

    //http://localhost:4200/my-properties/create-property?transactionHashes=7afnpaj32kUGmGzbNxhjcid5vfbMBvZA72qv6qSQwfGx
  }

  updateProperty(object: { [prop: string]: any }): void {
    const accountId = this.nearApiService.accountId;
    const args = { owner: accountId, ...object };

    console.log('@updateProperty: ' + JSON.stringify(args));

    this.nearApiService.callMethod({
      contractId: CONTRACT_ID,
      method: 'updateProperty',
      args,
    });

    //http://localhost:4200/my-properties/create-property?transactionHashes=7afnpaj32kUGmGzbNxhjcid5vfbMBvZA72qv6qSQwfGx
  }

  getUserProperties(): Observable<any[]> {
    const accountId = this.nearApiService.accountId;
    return from(this.nearApiService.viewMethod(CONTRACT_ID, 'getPropertiesByAccount', { accountId }));
  }
  deleteProperty(object: { [prop: string]: any }): void {
    const accountId = this.nearApiService.accountId;
    const args = { owner: accountId, ...object };

    console.log('@deleteProperty: ' + JSON.stringify(args));

    this.nearApiService.callMethod({
      contractId: CONTRACT_ID,
      method: 'deleteProperty',
      args,
    });
  }

  getPropertyById(id: string): Observable<object> {
    return from(this.nearApiService.viewMethod(CONTRACT_ID, 'getPropertyById', { id }));
  }
}
