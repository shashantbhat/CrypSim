import React, { createContext, useContext, useEffect, useState } from 'react';

export const WalletContext = createContext({
  wallet: null,
  connectWallet: () => {},
});

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);

  const connectWallet = async () => {
    if (!window.solana || !window.solana.isPhantom) {
      alert('Phantom wallet not found. Please install it.');
      return;
    }
  
    if (wallet) {
      console.log('Already connected');
      return;
    }
  
    try {
      const response = await window.solana.connect({ onlyIfTrusted: false });
      setWallet(response.publicKey.toString());
    } catch (err) {
      console.error('Wallet connection failed', err);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.solana && window.solana.isPhantom) {
        try {
          const resp = await window.solana.connect({ onlyIfTrusted: true });
          setWallet(resp.publicKey.toString());
        } catch (err) {
          // Not yet trusted
        }
      }
    };
    checkConnection();
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);