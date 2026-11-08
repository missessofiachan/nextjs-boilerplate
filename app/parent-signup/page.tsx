import type { Metadata } from 'next';
import AuthPageView from '../components/AuthPageView';

export const metadata: Metadata = {
  title: 'Parent sign up | Hartwell Primary School',
  description: 'Create a Hartwell Primary School parent travel portal account.',
};

export default function ParentSignupPage() {
  return <AuthPageView variant="parent-signup" />;
}
