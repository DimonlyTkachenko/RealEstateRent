import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui-js';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import type { AccountState, FinalExecutionOutcome, Wallet, WalletSelector } from '@near-wallet-selector/core';
import type { WalletSelectorModal } from '@near-wallet-selector/modal-ui-js';
import { providers, utils } from 'near-api-js';

export const CONTRACT_ID = 'realestaterentapp.testnet';
const TGAS = '30000000000000';
const NO_DEPOSIT = '0';

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
  account: AccountState;

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

  async isUserSignedIn(): Promise<boolean> {
    if (!this.isInitializedSubject.getValue()) {
      await this.initializeNearLogin();
    }
    const isSignedIn = this.selector.isSignedIn();
    this.isSignedInSubject.next(isSignedIn);
    return isSignedIn;
  }

  async initializeNearLogin() {
    const isInitialized = this.isInitializedSubject.getValue();
    debug('near login ui init, initialized: ' + isInitialized);
    if (isInitialized) {
      return;
    }
    const _selector = await setupWalletSelector({
      network: 'testnet',
      modules: [setupMyNearWallet()],
      debug: true,
    });

    const _modal = setupModal(_selector, {
      contractId: CONTRACT_ID,
      description: 'Please select a wallet..',
      theme: 'auto',
    });
    const state = _selector.store.getState();

    this.accounts = state.accounts;
    this.account = state.accounts.find((account) => account.active) || null;
    this.accountId = state.accounts.find((account) => account.active)?.accountId || null;

    window.selector = _selector;
    window.modal = _modal;

    this.selector = _selector;
    this.modal = _modal;

    this.isInitializedSubject.next(true);
    const isSignedIn = await this.isUserSignedIn();
    if (isSignedIn) {
      this.wallet = await this.selector.wallet();
    }
  }

  async viewMethod(contractId: string, method: string, args = {}) {
    const { network } = this.selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    let res = await provider.query({
      request_type: 'call_function',
      account_id: contractId,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
      finality: 'optimistic',
    });

    //@ts-ignore
    const finalResult = JSON.parse(Buffer.from(res.result).toString());
    console.log(`@viewMethod of '${method}' returned ${finalResult ? JSON.stringify(finalResult) : 'nothing'}`);

    return finalResult;
  }

  async callMethod({
    contractId,
    method,
    args = {},
    deposit = NO_DEPOSIT,
    gas = TGAS,
  }: {
    contractId: string;
    method: string;
    [prop: string]: any;
  }) {
    // first check if user is signed in..
    if (!(await this.isUserSignedIn())) {
      this.signIn();
      return;
    }
    // Sign a transaction with the "FunctionCall" action
    const result = await this.wallet.signAndSendTransaction({
      signerId: this.accountId,
      receiverId: contractId,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: method,
            args,
            gas,
            deposit: deposit,
          },
        },
      ],
    });
    console.log(`@callMethod of '${method}' finished`);
    const finalRes = result ? providers.getTransactionLastResult(result) : null;
    console.log(`@callMethod of '${method}' ended with result: ${finalRes ? JSON.stringify(finalRes) : 'void'}`);
    return finalRes;
  }

  public parseNearAmount(amount: string) {
    return utils.format.parseNearAmount(amount.toString());
  }

  public async getTransactionResult(txhash: string): Promise<any> {
    const walletSelector = await this.selector;
    const { network } = walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    // Retrieve transaction result from the network
    const transaction = await provider.txStatus(txhash, 'unnused');
    return providers.getTransactionLastResult(transaction);
  }

  // async callFunction(){
  //   this.account.
  // }
}
//http://localhost:4200/property/41?transactionHashes=GJAMFMQY1Z1ZVaQPiEABy176d4F3XAhukRgHbuk5fL8t

function debug(title: string, obj?: any, isStringify = false): void {
  console.log(title);
  if (obj !== undefined) {
    if (isStringify) {
      console.log(JSON.stringify(obj));
    }
    console.log(obj);
  }
}
