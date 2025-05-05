import React, { useState } from 'react';
import { sendSol } from '../utils/solana';
import { useWallet } from '../context/WalletContext';

const TransferForm = () => {
  const { wallet } = useWallet();
  const [toPublicKey, setToPublicKey] = useState('');
  const [amount, setAmount] = useState('');

  const handleSend = async () => {
    if (!wallet || !toPublicKey || !amount) {
      alert('All fields are required.');
      return;
    }
    try {
      const sig = await sendSol(wallet, toPublicKey, parseFloat(amount));
      alert(`Transaction successful!\nSignature: ${sig}`);
    } catch (err) {
      console.error(err);
      alert('Transaction failed');
    }
  };

  return (
    <div className="transfer-form">
      <h3>Send SOL</h3>
      <input
        type="text"
        placeholder="Recipient Public Key"
        value={toPublicKey}
        onChange={(e) => setToPublicKey(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount (SOL)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default TransferForm;
