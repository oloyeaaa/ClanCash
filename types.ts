
import { Timestamp } from 'firebase/firestore';

export interface ExpenseItem {
  id?: string;
  name: string;
  price: number;
  direct_debit_date: Timestamp | Date;
  category: string;
  familyId: string; // The shared clan identifier
  createdBy: string; // Individual user ID
  creatorName: string; // Individual user display name
  createdAt: Timestamp | Date;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  familyId: string; // The clan this user belongs to
}

export enum ExpenseCategory {
  Housing = "Housing",
  Groceries = "Groceries",
  Utilities = "Utilities",
  Entertainment = "Entertainment",
  Transport = "Transport",
  Other = "Other"
}
