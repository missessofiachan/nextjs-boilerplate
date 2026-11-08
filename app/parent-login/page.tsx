import type { Metadata } from 'next';
import AuthPageView from '../components/AuthPageView';

export const metadata: Metadata = {
  title: 'Parent login | Hartwell Primary School',
  description: "Parent sign in for Hartwell Primary School's Sustainable Travel Portal.",
};

export default function ParentLoginPage() {
  return <AuthPageView variant="parent-login" />;
}
