import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui-js';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import type {
  AccountState,
  Wallet,
  WalletSelector,
} from '@near-wallet-selector/core';
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
  private isInitializedSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public isInitialized$: Observable<boolean> =
    this.isInitializedSubject.asObservable();

  network: string;
  accounts: Array<AccountState>;
  selector: WalletSelector;
  wallet: Wallet;
  modal: WalletSelectorModal;
  accountId: string;

  constructor() {
    this.network = 'testnet';
    this.initializeNearLogin();
  }

  signIn() {
    this.modal.show();
  }

  signOut() {
    this.wallet.signOut();
    this.wallet = this.accountId = null;
  }

  isUserSignedIn(): boolean {
    return this.selector.isSignedIn();
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
    this.accountId =
      state.accounts.find((account) => account.active)?.accountId || null;

    window.selector = _selector;
    window.modal = _modal;

    this.selector = _selector;
    this.modal = _modal;

    this.isInitializedSubject.next(true);
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
