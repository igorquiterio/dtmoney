import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

interface ITransaction {
  id: number;
  title: string;
  type: string;
  category: string;
  amount: number;
  createdAt: string;
}

type TransactionInput = Omit<ITransaction, 'id' | 'createdAt'>;

interface ITransactionsContextData {
  transactions: ITransaction[];
  createTransaction(transaction: TransactionInput): Promise<void>;
}

interface TransactionsProviderProps {
  children: React.ReactNode;
}

const TransactionsContext = createContext<ITransactionsContextData>(
  {} as ITransactionsContextData
);

export function TransactionsProvider({ children }: TransactionsProviderProps) {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  useEffect(() => {
    api
      .get('transactions')
      .then((response) => setTransactions(response.data.transactions));
  }, []);

  async function createTransaction(transaction: TransactionInput) {
    const response = await api.post('/transactions', transaction);

    const { transaction: newTransaction } = response.data;

    setTransactions([...transactions, newTransaction]);
  }

  return (
    <TransactionsContext.Provider value={{ transactions, createTransaction }}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);

  if (!context) {
    throw new Error(
      'useTransactions must be used within a TransactionsProvider'
    );
  }

  return context;
}
