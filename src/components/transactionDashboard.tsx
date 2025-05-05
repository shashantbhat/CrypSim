import { useEffect, useState } from "react";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";

function TransactionDashboard({ wallet, refresh }: { wallet: string, refresh: number }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const connection = new Connection(clusterApiUrl("devnet"));

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!wallet) return;
      setLoading(true);
      try {
        const pubKey = new PublicKey(wallet);
        const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 5 });

        const txnDetails = await Promise.all(
          signatures.map(sig =>
            connection.getTransaction(sig.signature, { commitment: "confirmed" })
          )
        );

        setTransactions(txnDetails.filter(txn => txn)); // Filter out nulls
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [wallet, refresh]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Latest Transactions</h2>
      {loading ? (
        <p>Loading...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((txn: any, idx: number) => {
            // Log the transaction details for debugging
            console.log("Full Transaction:", txn);

            // Extract the SOL transfer amount
            const amountTransferred = txn.transaction.message.instructions
              .filter((instr: any) => instr.parsed && instr.parsed.type === "transfer")
              .map((instr: any) => {
                // Log the instruction to inspect it
                console.log("Instruction:", instr);

                if (instr.parsed?.info?.lamports) {
                  const amount = instr.parsed.info.lamports / 1e9; // Convert lamports to SOL
                  console.log(`Transferred  Amount: ${amount} SOL`);
                  return amount;
                }
                return 0;
              })
              .reduce((total: number, amount: number) => total + amount, 0); // Sum the amounts

            return (
              <li key={idx} className="border p-2 rounded">
                <p><strong>Signature:</strong> {txn.transaction.signatures[0]}</p>
                <p><strong>Slot:</strong> {txn.slot}</p>
                <p><strong>Status:</strong> {txn.meta?.err ? "Failed" : "Success"}</p>
                <p><strong>Amount:</strong> {amountTransferred} SOL</p>
              </li>
            );
          })}
        </ul>
      )} 
    </div>
  );
}

export default TransactionDashboard;