import type { Metadata } from 'next';
import AuthPageView from '../components/AuthPageView';

export const metadata: Metadata = {
  title: 'Admin login | Hartwell Primary School',
  description: 'Authorised staff and administrator sign in for Hartwell Primary School.',
};

export default function AdminLoginPage() {
  return <AuthPageView variant="admin-login" />;
}
