import { Field, PublicKey, fetchAccount } from 'o1js';
import crypto from 'crypto';

import type {
  WorkerFunctions,
  ZkappWorkerReponse,
  ZkappWorkerRequest,
} from './zkappWorker';

export default class ZkappWorkerClient {
  // ---------------------------------------------------------------------------------------

  setActiveInstanceToDevnet() {
    return this._call('setActiveInstanceToDevnet', {});
  }

  loadContract() {
    return this._call('loadContract', {});
  }

  compileContract() {
    return this._call('compileContract', {});
  }

  fetchAccount({
    publicKey,
  }: {
    publicKey: PublicKey;
  }): ReturnType<typeof fetchAccount> {
    const result = this._call('fetchAccount', {
      publicKey58: publicKey.toBase58(),
    });
    return result as ReturnType<typeof fetchAccount>;
  }

  initZkappInstance(publicKey: PublicKey) {
    return this._call('initZkappInstance', {
      publicKey58: publicKey.toBase58(),
    });
  }

  async getHash(): Promise<Field> {
    const result = await this._call('getHash', {});
    return Field.fromJSON(JSON.parse(result as string));
  }

  createUpdateTransaction(newHash: Field) {
    return this._call('createUpdateTransaction', {
      newHash: JSON.stringify(newHash.toJSON())
    });
  }

  proveUpdateTransaction() {
    return this._call('proveUpdateTransaction', {});
  }

  async getTransactionJSON() {
    const result = await this._call('getTransactionJSON', {});
    return result;
  }

  hashAllergenList(allergenList: object): Field {
    const hash = crypto.createHash('sha256').update(JSON.stringify(allergenList)).digest('hex');
    const hashBigInt = BigInt('0x' + hash);
    return Field(hashBigInt.toString());
  }

  async verifyAllergen(inputHash: Field): Promise<boolean> {
    const result = await this._call('verifyAllergen', {
      inputHash: JSON.stringify(inputHash.toJSON()),
    });
    return result as boolean;
  }

  // ---------------------------------------------------------------------------------------

  worker: Worker;

  promises: {
    [id: number]: { resolve: (res: any) => void; reject: (err: any) => void };
  };

  nextId: number;

  constructor() {
    this.worker = new Worker(new URL('./zkappWorker.ts', import.meta.url));
    this.promises = {};
    this.nextId = 0;

    this.worker.onmessage = (event: MessageEvent<ZkappWorkerReponse>) => {
      this.promises[event.data.id].resolve(event.data.data);
      delete this.promises[event.data.id];
    };
  }

  _call(fn: WorkerFunctions, args: any) {
    return new Promise((resolve, reject) => {
      this.promises[this.nextId] = { resolve, reject };

      const message: ZkappWorkerRequest = {
        id: this.nextId,
        fn,
        args,
      };

      this.worker.postMessage(message);

      this.nextId++;
    });
  }
}