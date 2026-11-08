import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthPageView from '../components/AuthPageView';

export const metadata: Metadata = {
  title: 'Admin login | Hartwell Primary School',
  description: 'Authorised staff and administrator sign in for Hartwell Primary School.',
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a2b1d' }}></div>}>
      <AuthPageView variant="admin-login" />
    </Suspense>
  );
}
