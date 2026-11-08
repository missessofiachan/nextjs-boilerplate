'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert } from '@mui/material';
import '../auth.css';

export type AuthVariant = 'parent-login' | 'parent-signup' | 'admin-login';

export interface DemoAccount {
  id: 'parent' | 'teacher' | 'admin';
  roleLabel: string;
  name: string;
  initials: string;
  email: string;
  password: string;
  targetRoute: string;
  targetTitle: string;
  accessSummary: string;
}

export const DEMO_ACCOUNTS: Record<'parent' | 'teacher' | 'admin', DemoAccount> = {
  parent: {
    id: 'parent',
    roleLabel: 'Parent / Carer Demo',
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
    roleLabel: 'Teacher Demo (Year 4B)',
    name: 'Ms. Lin',
    initials: 'ML',
    email: 'teacher@hartwellps.vic.edu.au',
    password: 'HartwellTeacher2026!',
    targetRoute: '/s8',
    targetTitle: 'Classroom Smartboard Leaderboard (S8)',
    accessSummary: 'Classroom interactive whiteboard & hub roll call verification',
  },
  admin: {
    id: 'admin',
    roleLabel: 'School Admin Demo',
    name: 'Kim Le',
    initials: 'KL',
    email: 'admin@hartwellps.vic.edu.au',
    password: 'HartwellAdmin2026!',
    targetRoute: '/s6',
    targetTitle: 'Admin Hub Roll Call & KPIs (S6)',
    accessSummary: 'Admin roll call KPIs, detour overrides & Boroondara Council export',
  },
};

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m3 3 18 18M10.6 6.2A9.3 9.3 0 0 1 12 6c6.1 0 9.5 6 9.5 6a16 16 0 0 1-2.1 2.8M6.5 6.6C3.9 8.4 2.5 12 2.5 12s3.4 6 9.5 6a9.4 9.4 0 0 0 3.4-.6M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

export default function AuthPageView({ variant }: { variant: AuthVariant }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const loginWithDemo = (account: DemoAccount, immediate = false) => {
    const form = formRef.current;
    if (form) {
      const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
      const passInput = form.querySelector<HTMLInputElement>('input[name="password"]');

      if (emailInput) {
        emailInput.value = account.email;
        emailInput.setAttribute('aria-invalid', 'false');
      }
      if (passInput) {
        passInput.value = account.password;
        passInput.setAttribute('aria-invalid', 'false');
      }

      if (variant === 'parent-signup') {
        const firstInput = form.querySelector<HTMLInputElement>('input[name="firstName"]');
        const lastInput = form.querySelector<HTMLInputElement>('input[name="lastName"]');
        const confirmInput = form.querySelector<HTMLInputElement>('input[name="confirmPassword"]');
        const consentInput = form.querySelector<HTMLInputElement>('input[name="consent"]');
        if (firstInput) firstInput.value = 'Sarah';
        if (lastInput) lastInput.value = 'Mitchell';
        if (confirmInput) confirmInput.value = account.password;
        if (consentInput) consentInput.checked = true;
      }

      form.querySelectorAll<HTMLElement>('.field-error').forEach((el) => {
        el.style.display = 'none';
      });
    }

    if (immediate) {
      try {
        sessionStorage.setItem('hartwell_demo_user', JSON.stringify(account));
      } catch {
        // ignore storage errors
      }
      setStatusMessage(
        `Signed in as ${account.name} (${account.roleLabel}). Opening ${account.targetTitle}...`
      );
      router.push(account.targetRoute);
      return;
    }

    setStatusMessage(
      `Demo credentials filled for ${account.name} (${account.roleLabel}). Click submit or "Launch Portal" to open ${account.targetTitle}.`
    );
  };

  const renderDemoCard = (accounts: DemoAccount[], title: string) => (
    <details className="test-credentials-disclosure">
      <summary>{title}</summary>
      <div className="test-accounts-grid">
        {accounts.map((acc) => (
          <div key={acc.id} className="test-account-row">
            <div>
              <strong style={{ color: '#123e2b' }}>{acc.name}</strong> ({acc.roleLabel})
              <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#647069' }}>
                {acc.email} &bull; {acc.password}
              </div>
            </div>
            <button
              type="button"
              className="subnav-tab"
              style={{ padding: '4px 10px', fontSize: '11px' }}
              onClick={() => loginWithDemo(acc, false)}
            >
              Fill
            </button>
          </div>
        ))}
      </div>
    </details>
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = formRef.current;
    if (!form) return;

    let valid = true;

    form.querySelectorAll<HTMLInputElement>('input[required]').forEach((input) => {
      const field = input.closest('.field');
      const error = field?.querySelector<HTMLElement>('.field-error');
      const isCheckbox = input.type === 'checkbox';
      const hasValue = isCheckbox ? input.checked : input.value.trim().length > 0;
      const isEmailValid =
        input.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      const isPasswordField = input.hasAttribute('data-password-input');
      const isPasswordValid =
        !isPasswordField || input.value.length >= Number(input.minLength || 0);
      const inputValid = hasValue && isEmailValid && isPasswordValid;

      input.setAttribute('aria-invalid', String(!inputValid));
      if (error) error.style.display = inputValid ? 'none' : 'block';
      if (!inputValid && valid) input.focus();
      valid = valid && inputValid;
    });

    const confirm = form.querySelector<HTMLInputElement>('[data-confirm-password]');
    if (confirm) {
      const original = form.querySelector<HTMLInputElement>('[data-new-password]');
      const error = confirm.closest('.field')?.querySelector<HTMLElement>('.field-error');
      const matches = Boolean(
        original && confirm.value === original.value && confirm.value.length >= 8
      );
      confirm.setAttribute('aria-invalid', String(!matches));
      if (error) {
        error.textContent = matches ? '' : 'Passwords must match.';
        error.style.display = matches ? 'none' : 'block';
      }
      if (!matches && valid) confirm.focus();
      valid = valid && matches;
    }

    if (!valid) {
      setStatusMessage('');
      return;
    }

    const emailVal =
      form.querySelector<HTMLInputElement>('input[name="email"]')?.value.trim().toLowerCase() || '';
    const matchedDemo = Object.values(DEMO_ACCOUNTS).find(
      (acc) => acc.email.toLowerCase() === emailVal
    );
    const activeDemo =
      matchedDemo || (variant === 'admin-login' ? DEMO_ACCOUNTS.admin : DEMO_ACCOUNTS.parent);

    try {
      sessionStorage.setItem('hartwell_demo_user', JSON.stringify(activeDemo));
    } catch {
      // ignore storage errors
    }

    setStatusMessage(
      `Signed in as ${activeDemo.name} (${activeDemo.roleLabel}). Redirecting to ${activeDemo.targetTitle}...`
    );
    requestAnimationFrame(() => {
      statusRef.current?.focus();
    });
    router.push(activeDemo.targetRoute);
  };

  if (variant === 'parent-login') {
    return (
      <main className="auth-shell">
        <section className="story-panel" aria-labelledby="welcome-title">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true"></span>
            <span className="brand-copy">
              <strong>Hartwell Primary School</strong>
              <span className="brand-motto">“Strive for the Highest”</span>
              <span>Sustainable Travel Portal</span>
            </span>
          </Link>
          <div className="story-content">
            <p className="eyebrow">Parent portal</p>
            <h1 id="welcome-title">Your family’s school journey, all in one place.</h1>
            <p>
              Follow morning walking groups, view arrival updates and manage your children’s travel
              details securely.
            </p>
            <div className="trust-list" aria-label="Portal benefits">
              <div className="trust-item">
                <svg
                  className="trust-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path d="M12 21s7-4.4 7-11V5l-7-3-7 3v5c0 6.6 7 11 7 11Z" />
                  <path d="m9.5 11.5 1.7 1.7 3.7-4" />
                </svg>
                <strong>Private by design</strong>
                <span>Family information stays protected.</span>
              </div>
              <div className="trust-item">
                <svg
                  className="trust-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 8v4l2.7 1.6" />
                </svg>
                <strong>Morning updates</strong>
                <span>See arrivals during the school window.</span>
              </div>
            </div>
          </div>
          <p className="story-footer">A safe, active journey to school starts together.</p>
        </section>

        <section className="form-panel" aria-labelledby="login-title">
          <div className="form-topbar">
            <Link className="back-link" href="/">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to portal
            </Link>
            <span className="secure-label">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              Secure access
            </span>
          </div>

          <div className="form-wrap">
            <p className="form-kicker">Welcome back</p>
            <h2 id="login-title">Parent login</h2>
            <p className="form-intro">
              Sign in with the email address linked to your family account.
            </p>

            <nav className="access-switch" aria-label="Choose access type">
              <Link href="/parent-login" aria-current="page">
                Parent &amp; Carer
              </Link>
              <Link href="/admin-login?role=teacher">
                Teacher &amp; Duty
              </Link>
              <Link href="/admin-login?role=admin">
                School Admin
              </Link>
            </nav>

            {renderDemoCard([DEMO_ACCOUNTS.parent], 'Evaluation Credentials: Sarah Mitchell (Parent)')}

            <form ref={formRef} data-auth-form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <div className="field-head">
                  <label htmlFor="email">Email address</label>
                </div>
                <div className="input-wrap">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <p className="field-error">Enter a valid email address.</p>
              </div>

              <div className="field">
                <div className="field-head">
                  <label htmlFor="password">Password</label>
                  <a
                    className="field-link"
                    href="mailto:office@hartwellps.vic.edu.au?subject=Parent%20portal%20password%20help"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="input-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPass1 ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    minLength={8}
                    data-password-input
                    required
                  />
                  <button
                    className="password-toggle"
                    type="button"
                    data-password-toggle="password"
                    aria-label={showPass1 ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPass1((s) => !s)}
                  >
                    {showPass1 ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <p className="field-error">Enter your password (at least 8 characters).</p>
              </div>

              <button className="submit-button" type="submit">
                Sign in to parent portal
              </button>
              {statusMessage && (
                <Alert
                  ref={statusRef}
                  severity="success"
                  role="status"
                  tabIndex={-1}
                  sx={{ mt: 2, borderRadius: 2.5, fontWeight: 700, fontSize: 12.5 }}
                >
                  {statusMessage}
                </Alert>
              )}
            </form>

            <p className="form-footnote">
              New to the travel portal? <Link href="/parent-signup">Create a parent account</Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (variant === 'parent-signup') {
    return (
      <main className="auth-shell">
        <section className="story-panel" aria-labelledby="welcome-title">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true"></span>
            <span className="brand-copy">
              <strong>Hartwell Primary School</strong>
              <span className="brand-motto">“Strive for the Highest”</span>
              <span>Sustainable Travel Portal</span>
            </span>
          </Link>
          <div className="story-content">
            <p className="eyebrow">Join the community</p>
            <h1 id="welcome-title">Safer mornings start with a connected family.</h1>
            <p>
              Create your parent account to receive timely travel updates and access your child’s
              walking group information.
            </p>
            <div className="trust-list" aria-label="Account benefits">
              <div className="trust-item">
                <svg
                  className="trust-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path d="M8 18a4 4 0 0 1 8 0" />
                  <circle cx="12" cy="9" r="3" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <strong>One family account</strong>
                <span>Keep sibling travel details together.</span>
              </div>
              <div className="trust-item">
                <svg
                  className="trust-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path d="M5 12.5 9.2 17 19 7" />
                </svg>
                <strong>Verified connection</strong>
                <span>Link securely using school records.</span>
              </div>
            </div>
          </div>
          <p className="story-footer">
            Designed for Hartwell families and our active travel community.
          </p>
        </section>

        <section className="form-panel" aria-labelledby="signup-title">
          <div className="form-topbar">
            <Link className="back-link" href="/parent-login">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to login
            </Link>
            <span className="secure-label">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              Secure registration
            </span>
          </div>

          <div className="form-wrap">
            <p className="form-kicker">Get started</p>
            <h2 id="signup-title">Create parent account</h2>
            <p className="form-intro">
              Use the same details provided to the school office so we can match your family
              record.
            </p>

            {renderDemoCard([DEMO_ACCOUNTS.parent], 'Quick-Fill Parent Registration Demo')}

            <form ref={formRef} data-auth-form onSubmit={handleSubmit} noValidate>
              <div className="field-row">
                <div className="field">
                  <div className="field-head">
                    <label htmlFor="first-name">First name</label>
                  </div>
                  <div className="input-wrap">
                    <input
                      id="first-name"
                      name="firstName"
                      autoComplete="given-name"
                      placeholder="First name"
                      required
                    />
                  </div>
                  <p className="field-error">Enter your first name.</p>
                </div>
                <div className="field">
                  <div className="field-head">
                    <label htmlFor="last-name">Last name</label>
                  </div>
                  <div className="input-wrap">
                    <input
                      id="last-name"
                      name="lastName"
                      autoComplete="family-name"
                      placeholder="Last name"
                      required
                    />
                  </div>
                  <p className="field-error">Enter your last name.</p>
                </div>
              </div>

              <div className="field">
                <div className="field-head">
                  <label htmlFor="email">Email address</label>
                </div>
                <div className="input-wrap">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <p className="field-error">Enter a valid email address.</p>
              </div>

              <div className="field-row">
                <div className="field">
                  <div className="field-head">
                    <label htmlFor="new-password">Password</label>
                  </div>
                  <div className="input-wrap">
                    <input
                      id="new-password"
                      name="password"
                      type={showPass1 ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      minLength={8}
                      data-new-password
                      data-password-input
                      required
                    />
                    <button
                      className="password-toggle"
                      type="button"
                      data-password-toggle="new-password"
                      aria-label={showPass1 ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPass1((s) => !s)}
                    >
                      {showPass1 ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <p className="field-error">Use at least 8 characters.</p>
                </div>
                <div className="field">
                  <div className="field-head">
                    <label htmlFor="confirm-password">Confirm password</label>
                  </div>
                  <div className="input-wrap">
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type={showPass2 ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      minLength={8}
                      data-confirm-password
                      data-password-input
                      required
                    />
                    <button
                      className="password-toggle"
                      type="button"
                      data-password-toggle="confirm-password"
                      aria-label={showPass2 ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPass2((s) => !s)}
                    >
                      {showPass2 ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <p className="field-error">Passwords must match.</p>
                </div>
              </div>

              <label className="consent">
                <input type="checkbox" name="consent" required />
                <span>
                  I agree to the school’s{' '}
                  <a href="mailto:office@hartwellps.vic.edu.au?subject=Parent%20portal%20privacy%20policy">
                    privacy and acceptable use policy
                  </a>
                  .
                </span>
              </label>

              <button className="submit-button" type="submit">
                Create parent account
              </button>
              {statusMessage && (
                <Alert
                  ref={statusRef}
                  severity="success"
                  role="status"
                  tabIndex={-1}
                  sx={{ mt: 2, borderRadius: 2.5, fontWeight: 700, fontSize: 12.5 }}
                >
                  {statusMessage}
                </Alert>
              )}
            </form>

            <p className="form-footnote">
              Already have an account? <Link href="/parent-login">Sign in</Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <section className="story-panel" aria-labelledby="welcome-title">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true"></span>
          <span className="brand-copy">
            <strong>Hartwell Primary School</strong>
            <span className="brand-motto">“Strive for the Highest”</span>
            <span>Staff Operations Portal</span>
          </span>
        </Link>
        <div className="story-content">
          <p className="eyebrow">Authorised staff only</p>
          <h1 id="welcome-title">Morning travel operations, clearly in view.</h1>
          <p>
            Access roll calls, route alerts and safety reporting from the secure school
            administration portal.
          </p>
          <div className="trust-list" aria-label="Administration portal features">
            <div className="trust-item">
              <svg
                className="trust-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M4 19V9l8-5 8 5v10" />
                <path d="M8 19v-6h8v6M2 20h20" />
              </svg>
              <strong>School-managed</strong>
              <span>Restricted to approved staff accounts.</span>
            </div>
            <div className="trust-item">
              <svg
                className="trust-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M4 14h6V4H4v10Zm10 6h6V10h-6v10ZM4 20h6v-2H4v2Zm10-14h6V4h-6v2Z" />
              </svg>
              <strong>Operational overview</strong>
              <span>Monitor hubs and safety indicators.</span>
            </div>
          </div>
        </div>
        <p className="story-footer">
          Access activity is monitored under school security policy.
        </p>
      </section>

      <section className="form-panel" aria-labelledby="login-title">
        <div className="form-topbar">
          <Link className="back-link" href="/">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to portal
          </Link>
          <span className="secure-label">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            Restricted access
          </span>
        </div>

        <div className="form-wrap">
          <p className="form-kicker">Staff operations</p>
          <h2 id="login-title">Staff &amp; Operations Login</h2>
          <p className="form-intro">
            Use your official Hartwell Primary School credentials to access active duty and administrative tools.
          </p>

          <nav className="access-switch" aria-label="Choose access type">
            <Link href="/parent-login">
              Parent &amp; Carer
            </Link>
            <Link href="/admin-login?role=teacher" aria-current="page">
              Teacher &amp; Duty
            </Link>
            <Link href="/admin-login?role=admin">
              School Admin
            </Link>
          </nav>

          <div className="admin-note">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M12 21s7-4.4 7-11V5l-7-3-7 3v5c0 6.6 7 11 7 11Z" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span>
              This area contains sensitive student travel information. Sign in only from a trusted
              school-managed device.
            </span>
          </div>

          {renderDemoCard(
            [DEMO_ACCOUNTS.teacher, DEMO_ACCOUNTS.admin],
            'Evaluation Credentials: Staff Accounts (Teacher & Admin)'
          )}

          <form ref={formRef} data-auth-form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <div className="field-head">
                <label htmlFor="staff-email">Staff email address</label>
              </div>
              <div className="input-wrap">
                <input
                  id="staff-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="name@hartwellps.vic.edu.au"
                  required
                />
              </div>
              <p className="field-error">Enter your staff email address.</p>
            </div>

            <div className="field">
              <div className="field-head">
                <label htmlFor="admin-password">Password</label>
                <a
                  className="field-link"
                  href="mailto:it@hartwellps.vic.edu.au?subject=Admin%20portal%20access%20help"
                >
                  Access help
                </a>
              </div>
              <div className="input-wrap">
                <input
                  id="admin-password"
                  name="password"
                  type={showPass1 ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your staff password"
                  minLength={8}
                  data-password-input
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  data-password-toggle="admin-password"
                  aria-label={showPass1 ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPass1((s) => !s)}
                >
                  {showPass1 ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <p className="field-error">Enter your password (at least 8 characters).</p>
            </div>

            <button className="submit-button" type="submit">
              Continue to admin portal
            </button>
            {statusMessage && (
              <Alert
                ref={statusRef}
                severity="success"
                role="status"
                tabIndex={-1}
                sx={{ mt: 2, borderRadius: 2.5, fontWeight: 700, fontSize: 12.5 }}
              >
                {statusMessage}
              </Alert>
            )}
          </form>

          <p className="form-footnote">
            Are you a parent or carer? <Link href="/parent-login">Use parent login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
