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

  async createNewProperty(object: { [prop: string]: any }): Promise<any> {
    const accountId = this.nearApiService.accountId;
    const args = {
      owner: accountId,
      creationDate: new Date().toISOString(),
      ...object,
    };

    console.log('@createNewProperty: ' + JSON.stringify(args));

    await this.nearApiService.callMethod({
      contractId: CONTRACT_ID,
      method: 'addProperty',
      args,
    });
  }

  async updateProperty(object: { [prop: string]: any }): Promise<any> {
    const accountId = this.nearApiService.accountId;
    const args = { owner: accountId, ...object };

    console.log('@updateProperty: ' + JSON.stringify(args));

    await this.nearApiService.callMethod({
      contractId: CONTRACT_ID,
      method: 'updateProperty',
      args,
    });
  }

  getUserProperties(): Observable<any[]> {
    const accountId = this.nearApiService.accountId;
    return from(this.nearApiService.viewMethod(CONTRACT_ID, 'getPropertiesByAccount', { accountId }));
  }
  async deleteProperty(object: { [prop: string]: any }): Promise<any> {
    const accountId = this.nearApiService.accountId;
    const args = { owner: accountId, ...object };

    console.log('@deleteProperty: ' + JSON.stringify(args));

    await this.nearApiService.callMethod({
      contractId: CONTRACT_ID,
      method: 'deleteProperty',
      args,
    });
  }

  async createComment(object: { [prop: string]: any }): Promise<any> {
    const accountId = this.getUserAccountId();
    const args = { accountId: accountId, creationDate: new Date().toISOString(), ...object };

    console.log('@createComment: ' + JSON.stringify(args));

    await this.nearApiService.callMethod({
      contractId: CONTRACT_ID,
      method: 'createComment',
      args,
    });
  }

  getPropertyComments(propertyId: string) {
    return from(this.nearApiService.viewMethod(CONTRACT_ID, 'getCommentsByProperty', { id: propertyId }));
  }

  getPropertyById(id: string): Observable<object> {
    return from(this.nearApiService.viewMethod(CONTRACT_ID, 'getPropertyById', { id }));
  }

  uploadImage(image: File): Observable<Object> {
    const formData = new FormData();

    formData.append('image', image, image.name);

    return this.http.post<{ url: string }>('http://localhost:3000/upload', formData);
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
}
