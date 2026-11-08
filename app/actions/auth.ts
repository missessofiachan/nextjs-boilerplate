'use server';

import { redirect } from 'next/navigation';
import {
  OFFICIAL_ACCOUNTS,
  UserRole,
  createSession,
  deleteSession,
} from '../lib/session';

export interface AuthActionState {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();
  const selectedRole = formData.get('role')?.toString() as UserRole | undefined;

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  // Check matching official role account
  let matchedAccount = Object.values(OFFICIAL_ACCOUNTS).find(
    (acc) => acc.email.toLowerCase() === email
  );

  // If role was explicitly specified and matches email
  if (selectedRole && OFFICIAL_ACCOUNTS[selectedRole]?.email.toLowerCase() === email) {
    matchedAccount = OFFICIAL_ACCOUNTS[selectedRole];
  }

  if (!matchedAccount) {
    // If it's a parent email with arbitrary standard domain (e.g. custom parent account)
    if (email.includes('@') && password.length >= 8) {
      const namePart = email.split('@')[0];
      const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      await createSession({
        role: 'parent',
        name: capitalized,
        initials: capitalized.slice(0, 2).toUpperCase(),
        email,
        roleLabel: 'Parent & Carer',
        targetRoute: '/s7',
        targetTitle: 'Parent Geofence Portal (S7)',
        accessSummary: 'Parental live geofence portal & sibling arrival alerts',
      });
      redirect('/s7');
    }
    return { error: 'Invalid email address or unauthorized staff account.' };
  }

  if (matchedAccount.password !== password) {
    return { error: 'Incorrect password. Please verify your credentials.' };
  }

  await createSession({
    role: matchedAccount.role,
    name: matchedAccount.name,
    initials: matchedAccount.initials,
    email: matchedAccount.email,
    roleLabel: matchedAccount.roleLabel,
    targetRoute: matchedAccount.targetRoute,
    targetTitle: matchedAccount.targetTitle,
    accessSummary: matchedAccount.accessSummary,
  });

  redirect(matchedAccount.targetRoute);
}

export async function signupAction(
  prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const firstName = formData.get('firstName')?.toString().trim();
  const lastName = formData.get('lastName')?.toString().trim();
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();
  const confirmPassword = formData.get('confirmPassword')?.toString();
  const consent = formData.get('consent');

  if (!firstName || !lastName || !email || !password) {
    return { error: 'All fields are required.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  if (!consent) {
    return { error: 'You must agree to the school privacy and acceptable use policy.' };
  }

  const fullName = `${firstName} ${lastName}`;
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();

  await createSession({
    role: 'parent',
    name: fullName,
    initials: initials || 'P',
    email,
    roleLabel: 'Parent & Carer',
    targetRoute: '/s7',
    targetTitle: 'Parent Geofence Portal (S7)',
    accessSummary: 'Parental live geofence portal & sibling arrival alerts',
  });

  redirect('/s7');
}

export async function logoutAction() {
  await deleteSession();
  redirect('/parent-login?loggedOut=1');
}

export async function switchRoleAction(role: UserRole) {
  const account = OFFICIAL_ACCOUNTS[role];
  if (!account) return;

  await createSession({
    role: account.role,
    name: account.name,
    initials: account.initials,
    email: account.email,
    roleLabel: account.roleLabel,
    targetRoute: account.targetRoute,
    targetTitle: account.targetTitle,
    accessSummary: account.accessSummary,
  });

  redirect(account.targetRoute);
}
