
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  Timestamp,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebaseConfig.ts';
import { ExpenseItem, UserProfile, ExpenseCategory } from '../types.ts';

const EXPENSES_COLLECTION = 'expenses';
const USERS_COLLECTION = 'users';

/**
 * User Profile Services
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
  return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
};

export const createUserProfile = async (profile: UserProfile) => {
  return await setDoc(doc(db, USERS_COLLECTION, profile.uid), profile);
};

/**
 * Subscription for all users in the same clan
 */
export const subscribeToClanMembers = (familyId: string, callback: (members: UserProfile[]) => void) => {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('familyId', '==', familyId)
  );

  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map(doc => doc.data() as UserProfile);
    callback(members);
  }, (error) => {
    console.error("Firestore Clan Members Subscription Error:", error);
  });
};

/**
 * Expense Services
 */
export const addExpense = async (expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
  return await addDoc(collection(db, EXPENSES_COLLECTION), {
    ...expense,
    createdAt: Timestamp.now(),
  });
};

export const deleteExpense = async (id: string) => {
  return await deleteDoc(doc(db, EXPENSES_COLLECTION, id));
};

export const subscribeToFamilyExpenses = (familyId: string, callback: (expenses: ExpenseItem[]) => void) => {
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where('familyId', '==', familyId)
  );

  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ExpenseItem[];

    const sortedExpenses = expenses.sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    callback(sortedExpenses);
  }, (error) => {
    console.error("Firestore Family Subscription Error:", error);
  });
};

/**
 * Seed Sample Data
 */
export const seedSampleData = async (familyId: string, userId: string, userName: string) => {
  const batch = writeBatch(db);
  const now = new Date();
  
  const samples = [
    { name: 'Monthly Rent', price: 1250, category: ExpenseCategory.Housing, daysOffset: -5 },
    { name: 'Netflix Premium', price: 15.99, category: ExpenseCategory.Entertainment, daysOffset: -2 },
    { name: 'Whole Foods Groceries', price: 84.50, category: ExpenseCategory.Groceries, daysOffset: 0 },
    { name: 'Electric Bill', price: 112.30, category: ExpenseCategory.Utilities, daysOffset: 2 },
    { name: 'Gas Station', price: 45.00, category: ExpenseCategory.Transport, daysOffset: -10 }
  ];

  samples.forEach(sample => {
    const docRef = doc(collection(db, EXPENSES_COLLECTION));
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + sample.daysOffset);
    
    batch.set(docRef, {
      name: sample.name,
      price: sample.price,
      category: sample.category,
      direct_debit_date: Timestamp.fromDate(targetDate),
      familyId,
      createdBy: userId,
      creatorName: userName,
      createdAt: Timestamp.now()
    });
  });

  await batch.commit();
};
