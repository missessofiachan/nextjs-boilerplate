import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthPageView from '../components/AuthPageView';

export const metadata: Metadata = {
  title: 'Parent login | Hartwell Primary School',
  description: "Parent sign in for Hartwell Primary School's Sustainable Travel Portal.",
};

export default function ParentLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a2b1d' }}></div>}>
      <AuthPageView variant="parent-login" />
    </Suspense>
  );
}
