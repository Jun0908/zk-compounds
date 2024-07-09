import { AllergyChecker } from './AllergyChecker.js';
import { Field, Mina, PrivateKey, AccountUpdate } from 'o1js';
import fs from 'fs';
import crypto from 'crypto';

const useProof = false;

const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);

const deployerAccount = Local.testAccounts[0];
const deployerKey = deployerAccount.key;
const senderAccount = Local.testAccounts[1];
const senderKey = senderAccount.key;

// 公開/秘密鍵ペアを生成。公開鍵はzkAppのデプロイ先アドレス
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

// アレルゲンリストのハッシュ化関数
function hashAllergenList(list: object): Field {
  const hash = crypto.createHash('sha256').update(JSON.stringify(list)).digest('hex');
  const hashBigInt = BigInt('0x' + hash); // ハッシュをBigIntに変換
  return Field(hashBigInt);
}

// JSONファイルからアレルゲンリストを読み込み
const allergenList = JSON.parse(fs.readFileSync('./allergenChecker.json', 'utf8'));
const allergenListHash = hashAllergenList(allergenList);

// AllergyCheckerのインスタンスを作成し、zkAppAddressにデプロイ
const zkAppInstance = new AllergyChecker(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, async () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy({ verificationKey: { data: 'some-verification-key-data', hash: allergenListHash } }); // 正しい構造を提供
});
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

// デプロイ後のAllergyCheckerの初期状態を取得
const initialHash = zkAppInstance.allergenListHash.get();
console.log('state after init:', initialHash.toString());

// フロントエンドからの入力を受け取る関数
async function verifyAllergenList(inputAllergenList: { ingredients: string[] }) {
  const inputHashToVerify = hashAllergenList(inputAllergenList);

  const txn1 = await Mina.transaction(senderAccount, async () => {
    await zkAppInstance.verifyAllergen(inputHashToVerify);
  });
  await txn1.prove();
  await txn1.sign([senderKey]).send();

  console.log('Allergen verification passed.');
}

// フロントエンドから入力されるアレルゲンリストの検証関数をエクスポート
export { verifyAllergenList };
