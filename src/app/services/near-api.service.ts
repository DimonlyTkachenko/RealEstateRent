import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui-js';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import type { AccountState, Wallet, WalletSelector } from '@near-wallet-selector/core';
import type { WalletSelectorModal } from '@near-wallet-selector/modal-ui-js';

declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
  }
}

@Injectable({
  providedIn: 'root',
})
export class NearApiService {
  private isInitializedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isInitialized$: Observable<boolean> = this.isInitializedSubject.asObservable();
  private isSignedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isSignedIn$: Observable<boolean> = this.isSignedInSubject.asObservable();

  network: string;
  accounts: Array<AccountState>;
  selector: WalletSelector;
  wallet: Wallet;
  modal: WalletSelectorModal;
  accountId: string;

  constructor() {
    this.initializeNearLogin();
  }

  async signIn() {
    const isInitialized = this.isInitializedSubject.getValue();
    const isSignedIn = this.isSignedInSubject.getValue();

    console.log('initialized: ' + isInitialized);
    console.log('signed in: ' + isSignedIn);

    if (isInitialized && !isSignedIn) {
      this.modal.show();
    } else {
      await this.initializeNearLogin();
      this.modal.show();
    }
  }

  async signOut() {
    if (this.selector) {
      this.wallet = await this.selector.wallet();
      this.wallet.signOut();
      this.isSignedInSubject.next(false);
      this.isInitializedSubject.next(false);
      this.wallet = this.accountId = null;
    }
  }

  isUserSignedIn(): boolean {
    const isSignedIn = this.selector.isSignedIn();
    this.isSignedInSubject.next(isSignedIn);
    return isSignedIn;
  }

  async initializeNearLogin() {
    debug('near login ui init..');
    const _selector = await setupWalletSelector({
      network: 'testnet',
      modules: [setupMyNearWallet()],
    });

    const _modal = setupModal(_selector, {
      contractId: 'guest-book.testnet',
    });
    const state = _selector.store.getState();

    this.accounts = state.accounts;
    this.accountId = state.accounts.find((account) => account.active)?.accountId || null;

    window.selector = _selector;
    window.modal = _modal;

    this.selector = _selector;
    this.modal = _modal;

    this.isInitializedSubject.next(true);
    this.isUserSignedIn();
  }
}

function debug(title: string, obj?: any, isStringify = false): void {
  console.log(title);
  if (obj !== undefined) {
    if (isStringify) {
      console.log(JSON.stringify(obj));
    }
    console.log(obj);
  }
}
