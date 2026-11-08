import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthPageView from '../components/AuthPageView';

export const metadata: Metadata = {
  title: 'Parent sign up | Hartwell Primary School',
  description: 'Create a Hartwell Primary School parent travel portal account.',
};

export default function ParentSignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a2b1d' }}></div>}>
      <AuthPageView variant="parent-signup" />
    </Suspense>
  );
}
