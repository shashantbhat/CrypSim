import React, { useState, useEffect } from 'react';
import { getBalance, sendSol, airdropSol } from './utils/solana';
import TransactionDashboard from './components/transactionDashboard';
import { WalletProvider, useWallet } from './WalletContext';

function MainApp() {
  const { wallet, connectWallet } = useWallet();
  const [balance, setBalance] = useState(null);
  const [toPublicKey, setToPublicKey] = useState('');
  const [amount, setAmount] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet) {
        const bal = await getBalance(wallet);
        setBalance(bal);
      }
    };
    fetchBalance();
  }, [wallet]);

  const handleSend = async () => {
    try {
      const sig = await sendSol(wallet, toPublicKey, parseFloat(amount));
      alert(`Transaction sent! Signature: ${sig}`);
    } catch (err) {
      alert('Transaction failed');
      console.error(err);
    }
    setRefreshTrigger(prev => prev + 1); // after transaction completes
  };

  const handleAirdrop = async () => {
    console.log("Wallet public key:", wallet);
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 1000; // initial retry delay (in ms)

    while (retryCount < maxRetries) {
        try {
            const sig = await airdropSol(wallet);
            alert(`Airdropped! Check Txn: ${sig}`);
            return;
        } catch (err) {
            if (err.message.includes("429")) {
                retryCount++;
                console.log(`Rate limit exceeded. Retrying in ${retryDelay * retryCount}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount)); // Exponential backoff
            } else {
                alert('Airdrop failed');
                console.error('Airdrop error:', err);
                break;
            }
        }
    }

    setRefreshTrigger(prev => prev + 1); // after transaction completes
};

  return (
    <div className="p-4">
      <h1>CrypSim</h1>
      <h2>A crypto currency simulator using solana integrated with the phantom wallet!</h2>
      {!wallet ? (
        <button onClick={connectWallet}>Connect Phantom Wallet</button>
      ) : (
        <>
          <p>Connected Wallet: {wallet}</p>
          <p>Balance: {balance} SOL</p>
          <button onClick={handleAirdrop}>Airdrop 1 SOL</button>
          <hr />
          <h3>Send SOL</h3>
          <input
            placeholder="Recipient Public Key"
            value={toPublicKey}
            onChange={(e) => setToPublicKey(e.target.value)}
          />
          <input
            placeholder="Amount (SOL)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={handleSend}>Send</button>

          <TransactionDashboard wallet={wallet} refresh={refreshTrigger}/>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <WalletProvider>
      <MainApp />
    </WalletProvider>
  );
}

export default App;