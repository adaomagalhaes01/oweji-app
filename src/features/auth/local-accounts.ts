import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AccountType, DeliveryAddress } from '@/store/profile-store';

export type LocalAccount = {
  name: string; email: string; phone: string; password: string; accountType: AccountType;
  storeId: string; storeName: string; storeDescription: string; storePhone: string;
  storeLocation: string; storeLogoUri: string | null; avatarUri: string | null;
  addresses: DeliveryAddress[];
};

const ACCOUNTS_KEY = 'oweji-local-accounts-v1';
export async function getLocalAccounts(): Promise<LocalAccount[]> {
  try { return JSON.parse(await AsyncStorage.getItem(ACCOUNTS_KEY) ?? '[]') as LocalAccount[]; }
  catch { return []; }
}
export async function saveLocalAccount(account: LocalAccount) {
  const accounts = await getLocalAccounts();
  const normalized = account.email.trim().toLowerCase();
  const index = accounts.findIndex((item) => item.email.trim().toLowerCase() === normalized);
  if (index < 0) accounts.push(account); else accounts[index] = account;
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}
export async function findLocalAccount(identity: string) {
  const normalized = identity.trim().toLowerCase();
  const phone = normalizePhone(normalized);
  return (await getLocalAccounts()).find((account) => account.email.trim().toLowerCase() === normalized || normalizePhone(account.phone) === phone);
}

export function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, '').toLowerCase();
}

export function getAccountsForIdentity(accounts: LocalAccount[], identity: string) {
  const normalized = identity.trim().toLowerCase();
  const phone = normalizePhone(normalized);
  return accounts.filter((account) => account.email.trim().toLowerCase() === normalized || normalizePhone(account.phone) === phone);
}
