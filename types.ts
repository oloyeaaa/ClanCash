
import { Timestamp } from 'firebase/firestore';

export interface ExpenseItem {
  id?: string;
  name: string;
  price: number;
  direct_debit_date: Timestamp | Date;
  category: string;
  createdBy: string; // User ID
  creatorName: string; // User Display Name
  createdAt: Timestamp | Date;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export enum ExpenseCategory {
  Housing = "Housing",
  Groceries = "Groceries",
  Utilities = "Utilities",
  Entertainment = "Entertainment",
  Transport = "Transport",
  Other = "Other"
}
