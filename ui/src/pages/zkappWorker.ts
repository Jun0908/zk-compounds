import { Mina, PublicKey, fetchAccount, Field } from 'o1js';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type { AllergyChecker } from '../../../contracts/build/src/AllergyChecker.js';

const state = {
  AllergyChecker: null as null | typeof AllergyChecker,
  zkapp: null as null | AllergyChecker,
  transaction: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const functions = {
  setActiveInstanceToDevnet: async (args: {}) => {
    const Network = Mina.Network(
      'https://api.minascan.io/node/devnet/v1/graphql'
    );
    console.log('Devnet network instance configured.');
    Mina.setActiveInstance(Network);
  },
  loadContract: async (args: {}) => {
    const { AllergyChecker } = await import('../../../contracts/build/src/AllergyChecker.js');
    state.AllergyChecker = AllergyChecker;
  },
  compileContract: async (args: {}) => {
    await state.AllergyChecker!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.zkapp = new state.AllergyChecker!(publicKey);
  },
  getHash: async (args: {}) => {
    const currentHash = await state.zkapp!.allergenListHash.get();
    return JSON.stringify(currentHash.toJSON());
  },
  createUpdateTransaction: async (args: { newHash: string }) => {
    const newHash = Field.fromJSON(JSON.parse(args.newHash));
    const transaction = await Mina.transaction(async () => {
      await state.zkapp!.updateAllergenHash(newHash);
    });
    state.transaction = transaction;
  },
  proveUpdateTransaction: async (args: {}) => {
    await state.transaction!.prove();
  },
  getTransactionJSON: async (args: {}) => {
    return state.transaction!.toJSON();
  },
  verifyAllergen: async (args: { inputHash: string }) => {
    const inputHash = Field.fromJSON(JSON.parse(args.inputHash));
    const transaction = await Mina.transaction(async () => {
      const storedHash = await state.zkapp!.allergenListHash.get();
      inputHash.assertEquals(storedHash);
    });
    await transaction.prove();
    const sentTx = await transaction.send();

    // トランザクションのハッシュが存在するかを確認
    if (sentTx.hash) {
      return true;
    } else {
      return false;
    }
  }
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkappWorkerReponse = {
  id: number;
  data: any;
};

if (typeof window !== 'undefined') {
  addEventListener(
    'message',
    async (event: MessageEvent<ZkappWorkerRequest>) => {
      const returnData = await functions[event.data.fn](event.data.args);

      const message: ZkappWorkerReponse = {
        id: event.data.id,
        data: returnData,
      };
      postMessage(message);
    }
  );
}

console.log('Web Worker Successfully Initialized.');




