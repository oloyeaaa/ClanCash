
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  Timestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebaseConfig.ts';
import { ExpenseItem } from '../types.ts';

const EXPENSES_COLLECTION = 'expenses';

export const addExpense = async (expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
  return await addDoc(collection(db, EXPENSES_COLLECTION), {
    ...expense,
    createdAt: Timestamp.now(),
  });
};

export const deleteExpense = async (id: string) => {
  return await deleteDoc(doc(db, EXPENSES_COLLECTION, id));
};

export const subscribeToExpenses = (userId: string, callback: (expenses: ExpenseItem[]) => void) => {
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where('createdBy', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ExpenseItem[];
    callback(expenses);
  });
};
