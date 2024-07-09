import { Field, PublicKey } from 'o1js';
import { useEffect, useState } from 'react';
import GradientBG from '../components/GradientBG';
import styles from '../styles/Home.module.css';
import './reactCOIServiceWorker';
import ZkappWorkerClient from './zkappWorkerClient';
import crypto from 'crypto';

let transactionFee = 0.1;
const ZKAPP_ADDRESS = 'B62qmsZ9QxoU7jo4yGxF1xNZ6xxoKfHoVHSXtVi7EZ7xNV1qjLYaVDs'; // デプロイされた AllergyChecker のアカウントアドレス

export default function Home() {
  const [state, setState] = useState({
    zkappWorkerClient: null as null | ZkappWorkerClient,
    hasWallet: null as null | boolean,
    hasBeenSetup: false,
    accountExists: false,
    currentHash: null as null | Field,
    publicKey: null as null | PublicKey,
    zkappPublicKey: null as null | PublicKey,
    creatingTransaction: false,
  });

  const [displayText, setDisplayText] = useState('');
  const [transactionlink, setTransactionLink] = useState('');

  const ingredients = ['Peanuts', 'Shellfish', 'Eggs']; // 固定のアレルゲンリスト

  useEffect(() => {
    async function timeout(seconds: number): Promise<void> {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, seconds * 1000);
      });
    }

    (async () => {
      if (!state.hasBeenSetup) {
        setDisplayText('Loading web worker...');
        console.log('Loading web worker...');
        const zkappWorkerClient = new ZkappWorkerClient();
        await timeout(5);

        setDisplayText('Done loading web worker');
        console.log('Done loading web worker');

        await zkappWorkerClient.setActiveInstanceToDevnet();

        const mina = (window as any).mina;

        if (mina == null) {
          setState({ ...state, hasWallet: false });
          return;
        }

        const publicKeyBase58: string = (await mina.requestAccounts())[0];
        const publicKey = PublicKey.fromBase58(publicKeyBase58);

        console.log(`Using key:${publicKey.toBase58()}`);
        setDisplayText(`Using key:${publicKey.toBase58()}`);

        setDisplayText('Checking if fee payer account exists...');
        console.log('Checking if fee payer account exists...');

        const res = await zkappWorkerClient.fetchAccount({
          publicKey: publicKey!,
        });
        const accountExists = res.error == null;

        await zkappWorkerClient.loadContract();

        console.log('Compiling zkApp...');
        setDisplayText('Compiling zkApp...');
        await zkappWorkerClient.compileContract();
        console.log('zkApp compiled');
        setDisplayText('zkApp compiled');

        const zkappPublicKey = PublicKey.fromBase58(ZKAPP_ADDRESS);

        await zkappWorkerClient.initZkappInstance(zkappPublicKey);

        console.log('Getting zkApp state...');
        setDisplayText('Getting zkApp state...');
        await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });
        const currentHash = await zkappWorkerClient.getHash();
        console.log(`Current state in zkApp: ${currentHash.toString()}`);
        setDisplayText('');

        setState({
          ...state,
          zkappWorkerClient,
          hasWallet: true,
          hasBeenSetup: true,
          publicKey,
          zkappPublicKey,
          accountExists,
          currentHash,
        });
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (state.hasBeenSetup && !state.accountExists) {
        for (;;) {
          setDisplayText('Checking if fee payer account exists...');
          console.log('Checking if fee payer account exists...');
          const res = await state.zkappWorkerClient!.fetchAccount({
            publicKey: state.publicKey!,
          });
          const accountExists = res.error == null;
          if (accountExists) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        setState({ ...state, accountExists: true });
      }
    })();
  }, [state.hasBeenSetup]);

  const onSendTransaction = async () => {
    setState({ ...state, creatingTransaction: true });

    setDisplayText('Creating a transaction...');
    console.log('Creating a transaction...');

    await state.zkappWorkerClient!.fetchAccount({
      publicKey: state.publicKey!,
    });

    // 入力されたアレルゲンリストをハッシュ化する関数
    function hashAllergenList(list: object): Field {
      const hash = crypto.createHash('sha256').update(JSON.stringify(list)).digest('hex');
      const hashBigInt = BigInt('0x' + hash);
      return Field(hashBigInt);
    }

    const newHash = hashAllergenList({ ingredients }); // 固定のアレルゲンリストをハッシュ化
    console.log(`New hash to be set: ${newHash.toString()}`);

    await state.zkappWorkerClient!.createUpdateTransaction(newHash);

    setDisplayText('Creating proof...');
    console.log('Creating proof...');
    await state.zkappWorkerClient!.proveUpdateTransaction();

    console.log('Requesting send transaction...');
    setDisplayText('Requesting send transaction...');
    const transactionJSON = await state.zkappWorkerClient!.getTransactionJSON();

    setDisplayText('Getting transaction JSON...');
    console.log('Getting transaction JSON...');
    const { hash } = await (window as any).mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: transactionFee,
        memo: '',
      },
    });

    const transactionLink = `https://minascan.io/devnet/tx/${hash}`;
    console.log(`View transaction at ${transactionLink}`);

    setTransactionLink(transactionLink);
    setDisplayText(transactionLink);

    await state.zkappWorkerClient!.fetchAccount({
      publicKey: state.zkappPublicKey!,
    });
    const currentHash = await state.zkappWorkerClient!.getHash();
    console.log(`Current state in zkApp after transaction: ${currentHash.toString()}`);

    setState({ ...state, creatingTransaction: false });
  };

  const onRefreshCurrentHash = async () => {
    console.log('Getting zkApp state...');
    setDisplayText('Getting zkApp state...');

    await state.zkappWorkerClient!.fetchAccount({
      publicKey: state.zkappPublicKey!,
    });
    const currentHash = await state.zkappWorkerClient!.getHash();
    setState({ ...state, currentHash });
    console.log(`Current state in zkApp: ${currentHash.toString()}`);
    setDisplayText('');
  };

  const onVerifyAllergen = async () => {
    function hashAllergenList(list: object): Field {
      const hash = crypto.createHash('sha256').update(JSON.stringify(list)).digest('hex');
      const hashBigInt = BigInt('0x' + hash);
      return Field(hashBigInt);
    }

    console.log('Verifying allergen list...');
    setDisplayText('Verifying allergen list...');

    const hash = hashAllergenList({ ingredients }); // 固定のアレルゲンリストをハッシュ化
    console.log(`Calculated hash: ${hash.toString()}`);

    const isValid = await state.zkappWorkerClient!.verifyAllergen(hash);

    if (isValid) {
      console.log('Allergen verification passed.');
      setDisplayText('Allergen verification passed.');
    } else {
      console.log('Allergen verification failed.');
      setDisplayText('Allergen verification failed.');
    }
  };

  let hasWallet;
  if (state.hasWallet != null && !state.hasWallet) {
    const auroLink = 'https://www.aurowallet.com/';
    const auroLinkElem = (
      <a href={auroLink} target="_blank" rel="noreferrer">
        Install Auro wallet here
      </a>
    );
    hasWallet = <div>Could not find a wallet. {auroLinkElem}</div>;
  }

  const stepDisplay = transactionlink ? (
    <a
      href={transactionlink}
      target="_blank"
      rel="noreferrer"
      style={{ textDecoration: 'underline' }}
    >
      View transaction
    </a>
  ) : (
    displayText
  );

  let setup = (
    <div
      className={styles.start}
      style={{ fontWeight: 'bold', fontSize: '1.5rem', paddingBottom: '5rem' }}
    >
      {stepDisplay}
      {hasWallet}
    </div>
  );

  let accountDoesNotExist;
  if (state.hasBeenSetup && !state.accountExists) {
    const faucetLink =
      'https://faucet.minaprotocol.com/?address=' + state.publicKey!.toBase58();
    accountDoesNotExist = (
      <div>
        <span style={{ paddingRight: '1rem' }}>Account does not exist.</span>
        <a href={faucetLink} target="_blank" rel="noreferrer">
          Visit the faucet to fund this fee payer account
        </a>
      </div>
    );
  }

  let mainContent;
  if (state.hasBeenSetup && state.accountExists) {
    mainContent = (
      <div style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className={styles.center} style={{ padding: 0 }}>
          Current state in zkApp: {state.currentHash!.toString()}{' '}
        </div>
        <button
          className={styles.card}
          onClick={onSendTransaction}
          disabled={state.creatingTransaction}
        >
          Send Transaction
        </button>
        <button className={styles.card} onClick={onRefreshCurrentHash}>
          Get Latest State
        </button>
        <button className={styles.card} onClick={onVerifyAllergen}>
          Verify Allergen List
        </button>
      </div>
    );
  }

  return (
    <GradientBG>
      <div className={styles.main} style={{ padding: 0 }}>
        <div className={styles.center} style={{ padding: 0 }}>
          {setup}
          {accountDoesNotExist}
          {mainContent}
        </div>
      </div>
    </GradientBG>
  );
}