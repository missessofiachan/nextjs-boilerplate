import 'server-only';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';

export type UserRole = 'parent' | 'teacher' | 'admin';

export interface UserAccount {
  id: UserRole;
  role: UserRole;
  roleLabel: string;
  name: string;
  initials: string;
  email: string;
  password: string;
  targetRoute: string;
  targetTitle: string;
  accessSummary: string;
}

export interface SessionPayload {
  role: UserRole;
  name: string;
  initials: string;
  email: string;
  roleLabel: string;
  targetRoute: string;
  targetTitle: string;
  accessSummary: string;
  expiresAt: number;
}

export const OFFICIAL_ACCOUNTS: Record<UserRole, UserAccount> = {
  parent: {
    id: 'parent',
    role: 'parent',
    roleLabel: 'Parent & Carer',
    name: 'Sarah Mitchell',
    initials: 'SM',
    email: 'parent@hartwellps.vic.edu.au',
    password: 'HartwellParent2026!',
    targetRoute: '/s7',
    targetTitle: 'Parent Geofence Portal (S7)',
    accessSummary: 'Parental live geofence portal & sibling arrival alerts',
  },
  teacher: {
    id: 'teacher',
    role: 'teacher',
    roleLabel: 'Teacher & Duty Staff',
    name: 'Ms. Mei Lin',
    initials: 'ML',
    email: 'teacher@hartwellps.vic.edu.au',
    password: 'HartwellTeacher2026!',
    targetRoute: '/s8',
    targetTitle: 'Classroom Smartboard Leaderboard (S8)',
    accessSummary: 'Classroom interactive whiteboard & hub roll call verification',
  },
  admin: {
    id: 'admin',
    role: 'admin',
    roleLabel: 'School Operations Admin',
    name: 'Kim Le',
    initials: 'KL',
    email: 'admin@hartwellps.vic.edu.au',
    password: 'HartwellAdmin2026!',
    targetRoute: '/s6',
    targetTitle: 'Admin Hub Roll Call & KPIs (S6)',
    accessSummary: 'Admin roll call KPIs, detour overrides & Boroondara Council export',
  },
};

export const ROLE_PERMITTED_SCREENS: Record<UserRole, string[]> = {
  parent: ['s7', 's4', 's8'],
  teacher: ['s8', 's1', 's2', 's3', 's4', 's5'],
  admin: ['s6', 's2', 's3', 's4', 's5', 's8', 's9'],
};

const SESSION_COOKIE_NAME = 'hartwell_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'hartwell-primary-school-secret-2026-secure-key-32b';

function sign(data: string): string {
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(data);
  return hmac.digest('base64url');
}

export function encryptSession(payload: SessionPayload): string {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString('base64url');
  const signature = sign(b64);
  return `${b64}.${signature}`;
}

export function decryptSession(sessionToken: string | undefined): SessionPayload | null {
  if (!sessionToken || !sessionToken.includes('.')) return null;
  const [b64, signature] = sessionToken.split('.');
  if (!b64 || !signature) return null;

  const expectedSig = sign(b64);
  try {
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(signature, 'utf-8'),
      Buffer.from(expectedSig, 'utf-8')
    );
    if (!isMatch) return null;

    const json = Buffer.from(b64, 'base64url').toString('utf-8');
    const parsed = JSON.parse(json) as SessionPayload;

    if (Date.now() > parsed.expiresAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function createSession(user: {
  role: UserRole;
  name: string;
  initials: string;
  email: string;
  roleLabel: string;
  targetRoute?: string;
  targetTitle?: string;
  accessSummary?: string;
}) {
  const defaultMeta = OFFICIAL_ACCOUNTS[user.role];
  const payload: SessionPayload = {
    role: user.role,
    name: user.name,
    initials: user.initials,
    email: user.email,
    roleLabel: user.roleLabel || defaultMeta.roleLabel,
    targetRoute: user.targetRoute || defaultMeta.targetRoute,
    targetTitle: user.targetTitle || defaultMeta.targetTitle,
    accessSummary: user.accessSummary || defaultMeta.accessSummary,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };

  const encrypted = encryptSession(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  return payload;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return decryptSession(token);
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
