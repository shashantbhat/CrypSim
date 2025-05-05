import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export const getBalance = async (pubKeyStr) => {
  const pubKey = new PublicKey(pubKeyStr);
  const balance = await connection.getBalance(pubKey);
  return balance / LAMPORTS_PER_SOL;
};

export const sendSol = async (fromPublicKeyStr, toPublicKeyStr, amount) => {
  const provider = window.solana;
  const fromPubKey = new PublicKey(fromPublicKeyStr);
  const toPubKey = new PublicKey(toPublicKeyStr);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromPubKey,
      toPubkey: toPubKey,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  transaction.feePayer = fromPubKey;
  const { blockhash } = await connection.getRecentBlockhash();
  transaction.recentBlockhash = blockhash;

  const signed = await provider.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(signature);
  return signature;
};

export const airdropSol = async (pubKeyStr) => {
    const pubKey = new PublicKey(pubKeyStr);
    const sig = await connection.requestAirdrop(pubKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig);
    return sig;
};