import { Injectable, inject } from '@angular/core';
import { NearApiService, CONTRACT_ID } from './near-api.service';
import { BehaviorSubject, Observable, from, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RealEstateService {
  private nearToUsdSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public nearToUsd$ = this.nearToUsdSubject.asObservable();

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
    this.getNearToDollarRate();
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

  // calls to contract
  getAllProperties(): Observable<any[]> {
    return from(this.nearApiService.viewMethod(CONTRACT_ID, 'getAllAvailableProperties'));
  }

  getPropertyComments(propertyId: string) {
    return from(this.nearApiService.viewMethod(CONTRACT_ID, 'getCommentsByProperty', { id: propertyId }));
  }

  getPropertyById(id: string): Observable<object> {
    return from(this.nearApiService.viewMethod(CONTRACT_ID, 'getPropertyById', { id }));
  }

  getUserProperties(): Observable<any[]> {
    const accountId = this.nearApiService.accountId;
    return from(this.nearApiService.viewMethod(CONTRACT_ID, 'getPropertiesByAccount', { accountId }));
  }
  async deleteProperty(object: { [prop: string]: any }): Promise<any> {
    const accountId = this.nearApiService.accountId;
    const args = { owner: accountId, ...object };

    console.log('@deleteProperty: ' + JSON.stringify(args));

    return await this.nearApiService.callMethod({
      contractId: CONTRACT_ID,
      method: 'deleteProperty',
      args,
    });
  }

  getPropertyBookings(propertyId: string): Observable<any[]> {
    return from(this.nearApiService.viewMethod(CONTRACT_ID, 'getBookingsByProperty', { id: propertyId }));
  }

  getUserBookings(): Observable<any[]> {
    const accountId = this.getUserAccountId();
    return from(this.nearApiService.viewMethod(CONTRACT_ID, 'getBookingsByUser', { id: accountId }));
  }

  async createNewProperty(object: { [prop: string]: any }): Promise<any> {
    const accountId = this.nearApiService.accountId;
    const args = {
      owner: accountId,
      creationDate: new Date().toISOString(),
      ...object,
    };

    console.log('@createNewProperty: ' + JSON.stringify(args));

    return await this.nearApiService.callMethod({
      contractId: CONTRACT_ID,
      method: 'addProperty',
      args,
    });
  }

  async updateProperty(object: { [prop: string]: any }): Promise<any> {
    const accountId = this.nearApiService.accountId;
    const args = { owner: accountId, ...object };

    console.log('@updateProperty: ' + JSON.stringify(args));

    return await this.nearApiService.callMethod({
      contractId: CONTRACT_ID,
      method: 'updateProperty',
      args,
    });
  }

  async createComment(object: { [prop: string]: any }): Promise<any> {
    const accountId = this.getUserAccountId();
    const args = { accountId: accountId, creationDate: new Date().toISOString(), ...object };

    console.log('@createComment: ' + JSON.stringify(args));

    return await this.nearApiService.callMethod({
      contractId: CONTRACT_ID,
      method: 'createComment',
      args,
    });
  }

  async createBooking(object: { [prop: string]: any }): Promise<any> {
    const accountId = this.getUserAccountId();
    const args = { tenant: accountId, creationDate: new Date().toISOString(), ...object };

    console.log('@createBooking: ' + JSON.stringify(args));

    return await this.nearApiService.callMethod({
      contractId: CONTRACT_ID,
      method: 'createNewBooking',
      args,
      deposit: object['bookingTotal'],
    });
  }

  async cancelBooking(bookingId: string): Promise<any> {
    const args = { id: bookingId };

    console.log('@cancelBooking: ' + JSON.stringify(args));

    return await this.nearApiService.callMethod({
      contractId: CONTRACT_ID,
      method: 'cancelBooking',
      args,
    });
  }

  getTranasctionResult(hash: string): Observable<any> {
    return from(this.nearApiService.getTransactionResult(hash));
  }

  async getNearToDollarRate() {
    const executeFunc = async () => {
      const response = await firstValueFrom(
        this.http.get<{ url: string }>('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd')
      );
      const mapping = response as any;
      if (mapping['near']) {
        const near2usd = Number(mapping['near']['usd'] || 0);
        this.nearToUsdSubject.next(near2usd);
      }
    };

    await executeFunc();

    setInterval(executeFunc, 60 * 1000);
  }

  uploadImage(image: File): Observable<Object> {
    const formData = new FormData();

    formData.append('image', image, image.name);

    return from(this.http.post<{ url: string }>('http://localhost:3000/upload', formData));
  }

  getUserAccountId(): string {
    return this.nearApiService.accountId;
  }

  sortByDate(data: any[], sortBy: string = 'creationDate'): any[] {
    return data.sort(function (a, b): number {
      const res = new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
      return res;
    });
  }
  parseNearAmount(amount: string) {
    return this.nearApiService.parseNearAmount(amount);
  }
}
