'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Chip, Stack, Tooltip } from '@mui/material';
import { DEMO_ACCOUNTS, DemoAccount } from './AuthPageView';
import {
  ScreenId,
  ViewportMode,
  ColorScheme,
  SCREEN_META,
  ALL_SCREEN_IDS,
  isValidScreenId,
} from '../data/prototype-data';

interface PrototypeWorkspaceProps {
  initialScreen?: ScreenId;
}

export default function PrototypeWorkspace({ initialScreen = 's1' }: PrototypeWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentScreenId, setCurrentScreenId] = useState<ScreenId>(initialScreen);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('auto');
  const [scheme, setScheme] = useState<ColorScheme>('scheme-b');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [historyOpen, setHistoryOpen] = useState<boolean>(true);
  const [sosDispatchedBanner, setSosDispatchedBanner] = useState<boolean>(false);

  // Settings & accessibility drawer state
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [accountDetailsOpen, setAccountDetailsOpen] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [largeText, setLargeText] = useState<boolean>(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState<boolean>(false);
  const [logoutConfirmed, setLogoutConfirmed] = useState<boolean>(false);
  const [activeUser, setActiveUser] = useState<{
    name: string;
    initials: string;
    roleLabel: string;
    email: string;
    accessSummary: string;
  }>({
    name: 'Kim Le',
    initials: 'KL',
    roleLabel: 'School travel partner',
    email: 'admin@hartwellps.vic.edu.au',
    accessSummary: 'Parent portal, whiteboard and council reporting',
  });

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('hartwell_demo_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name && parsed?.roleLabel) {
          setActiveUser(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Interactive form states for enhanced prototype realism while preserving exact defaults
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-02');
  const [selectedGroup, setSelectedGroup] = useState<string>(
    'Group G-04: Toorak Rd / Hartwell East 500m Hub (08:15 AM)'
  );
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [selectedCorridor, setSelectedCorridor] = useState<string>(
    'Corridor C-01: Toorak Rd / Camberwell Rd Crossing'
  );
  const [hazardSeverity, setHazardSeverity] = useState<'normal' | 'caution' | 'severe'>('severe');
  const [selectedAlternateRoute, setSelectedAlternateRoute] = useState<string>(
    'Route B: Myrtle Park Greenway 500m Hub (+4 mins | Sheltered)'
  );
  const [selectedChild, setSelectedChild] = useState<string>(
    'Leo Mitchell (Year 4B) — Active on Route B Detour'
  );
  const [selectedTrackingWindow, setSelectedTrackingWindow] = useState<string>(
    'Active ONLY 08:00–09:00 AM & 03:15–04:15 PM (School Commute)'
  );
  const [fontScale, setFontScale] = useState<'100' | '125' | '150'>('125');
  const [channels, setChannels] = useState<{ push: boolean; sms: boolean; email: boolean }>({
    push: true,
    sms: true,
    email: false,
  });

  // Sync with prop & URL query parameters (?screen=s8&scheme=scheme-b&vp=desktop&modal=1)
  useEffect(() => {
    setCurrentScreenId(initialScreen);
  }, [initialScreen]);

  useEffect(() => {
    const qScreen = searchParams.get('screen');
    const qScheme = searchParams.get('scheme');
    const qVp = searchParams.get('vp');
    const qModal = searchParams.get('modal');

    if (isValidScreenId(qScreen)) {
      setCurrentScreenId(qScreen.toLowerCase() as ScreenId);
    }
    if (qScheme === 'scheme-a' || qScheme === 'scheme-b') {
      setScheme(qScheme);
    }
    if (qVp === 'auto' || qVp === 'mobile' || qVp === 'desktop') {
      setViewportMode(qVp);
    }
    if (qModal === '1') {
      setModalOpen(true);
    }
  }, [searchParams]);

  // Keep body data-theme and data-high-contrast attributes in sync
  useEffect(() => {
    document.body.setAttribute('data-theme', scheme);
  }, [scheme]);

  useEffect(() => {
    document.body.setAttribute('data-high-contrast', String(highContrast));
  }, [highContrast]);

  // Apply bigger text scaling inside #prototype-viewport
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('#prototype-viewport *').forEach((element) => {
      const hasDirectText = Array.from(element.childNodes).some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
      );
      if (!hasDirectText) return;

      if (largeText) {
        if (!('originalInlineFontSize' in element.dataset)) {
          element.dataset.originalInlineFontSize = element.style.fontSize || '';
        }
        const currentSize = parseFloat(window.getComputedStyle(element).fontSize);
        if (currentSize) {
          element.style.fontSize = `${Math.max(currentSize * 1.18, currentSize + 2).toFixed(1)}px`;
        }
      } else if ('originalInlineFontSize' in element.dataset) {
        element.style.fontSize = element.dataset.originalInlineFontSize || '';
        delete element.dataset.originalInlineFontSize;
      }
    });
  }, [largeText]);

  // Escape key closes settings and logout modal
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setLogoutModalOpen(false);
      setSettingsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const navigateToScreen = (screenId: ScreenId, openSosModal = false) => {
    setCurrentScreenId(screenId);
    setSettingsOpen(false);
    setModalOpen(openSosModal);

    // Update browser route cleanly so every screen has a working shareable Next.js route
    const params = new URLSearchParams(searchParams.toString());
    params.delete('screen'); // Clean up legacy query param when navigating to dedicated route
    if (openSosModal) {
      params.set('modal', '1');
    } else {
      params.delete('modal');
    }
    const qs = params.toString();
    router.push(`/${screenId}${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  const switchDemoPersona = (account: DemoAccount) => {
    setActiveUser(account);
    try {
      sessionStorage.setItem('hartwell_demo_user', JSON.stringify(account));
    } catch {
      // ignore storage errors
    }
    const targetScreen = account.targetRoute.replace(/^\//, '') as ScreenId;
    if (isValidScreenId(targetScreen)) {
      navigateToScreen(targetScreen);
    }
  };

  const meta = SCREEN_META[currentScreenId] || SCREEN_META.s1;

  const isDesktopFrame =
    viewportMode === 'desktop'
      ? true
      : viewportMode === 'mobile'
      ? false
      : meta.defaultDesktop;

  const formFactorLabel = `${meta.personaLabel} ${
    isDesktopFrame ? '[Wide Desktop / Smartboard View]' : '[Mobile Handheld View]'
  }`;

  const memberAScreens = ALL_SCREEN_IDS.filter((id) => SCREEN_META[id].memberGroup === 'A');
  const memberBScreens = ALL_SCREEN_IDS.filter((id) => SCREEN_META[id].memberGroup === 'B');

  return (
    <div className="prototype-root" data-theme={scheme} data-high-contrast={String(highContrast)}>
      {/* TOP FIGMA / CASE TOOL BAR */}
      <header className="case-toolbar">
        <div className="case-brand">
          <span className="figma-badge">Figma Multi-Viewport Prototype</span>
          <div>
            <div className="case-title">
              Hartwell Primary School — Sustainable Travel System (S1–S9 | 2-Member Equal Split: 4.5 Screens Each)
            </div>
            <div className="case-subtitle">
              Member A (Sofia Mironenko: S1–S4 + S5 Co-Lead) &amp; Member B (S5 Co-Lead + S6–S9) | Mobile App + PC Web + Classroom Smartboard
            </div>
          </div>
        </div>

        <div className="toolbar-controls">
          {/* Material UI Stakeholder Demo Persona Bar */}
          <Stack
            direction="row"
            spacing={0.75}
            sx={{
              alignItems: 'center',
              bgcolor: '#0F172A',
              border: '1px solid #475569',
              borderRadius: '6px',
              px: 1,
              py: 0.4,
            }}
          >
            <Chip
              label={`Signed in: ${activeUser.name}`}
              size="small"
              sx={{
                height: 22,
                fontSize: 11,
                fontWeight: 800,
                bgcolor: '#1B5E20',
                color: '#FFFFFF',
              }}
            />
            <Tooltip title="Switch to Sarah Mitchell (Parent Demo — S7)">
              <Button
                size="small"
                variant={activeUser.email === DEMO_ACCOUNTS.parent.email ? 'contained' : 'text'}
                onClick={() => switchDemoPersona(DEMO_ACCOUNTS.parent)}
                sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: 11, color: '#E2E8F0' }}
              >
                Parent
              </Button>
            </Tooltip>
            <Tooltip title="Switch to Ms. Lin (Teacher Demo — S8)">
              <Button
                size="small"
                variant={activeUser.email === DEMO_ACCOUNTS.teacher.email ? 'contained' : 'text'}
                onClick={() => switchDemoPersona(DEMO_ACCOUNTS.teacher)}
                sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: 11, color: '#E2E8F0' }}
              >
                Teacher
              </Button>
            </Tooltip>
            <Tooltip title="Switch to Kim Le (Admin Demo — S6)">
              <Button
                size="small"
                variant={activeUser.email === DEMO_ACCOUNTS.admin.email ? 'contained' : 'text'}
                onClick={() => switchDemoPersona(DEMO_ACCOUNTS.admin)}
                sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: 11, color: '#E2E8F0' }}
              >
                Admin
              </Button>
            </Tooltip>
            <Tooltip title="Open dedicated Parent / Staff Auth Pages">
              <Button
                component={Link}
                href="/parent-login"
                size="small"
                variant="outlined"
                sx={{
                  minWidth: 0,
                  px: 1,
                  py: 0.2,
                  fontSize: 11,
                  borderColor: '#4ADE80',
                  color: '#4ADE80',
                }}
              >
                Auth Pages &rarr;
              </Button>
            </Tooltip>
          </Stack>

          {/* Viewport Switcher: Auto / Mobile / Desktop / Whiteboard */}
          <div className="btn-group" title="Switch Viewport Form Factor">
            <button
              id="vp-auto"
              type="button"
              className={`tb-btn ${viewportMode === 'auto' ? 'active-mode' : ''}`}
              onClick={() => setViewportMode('auto')}
            >
              Auto Form-Factor
            </button>
            <button
              id="vp-mobile"
              type="button"
              className={`tb-btn ${viewportMode === 'mobile' ? 'active-mode' : ''}`}
              onClick={() => setViewportMode('mobile')}
            >
              📱 Mobile App
            </button>
            <button
              id="vp-desktop"
              type="button"
              className={`tb-btn ${viewportMode === 'desktop' ? 'active-mode' : ''}`}
              onClick={() => setViewportMode('desktop')}
            >
              💻 PC / Classroom Whiteboard
            </button>
          </div>

          {/* Colour Scheme Switcher */}
          <div className="btn-group">
            <button
              id="btn-scheme-a"
              type="button"
              className={`tb-btn ${scheme === 'scheme-a' ? 'active-navy' : ''}`}
              onClick={() => setScheme('scheme-a')}
            >
              Scheme A: Navy (Rejected)
            </button>
            <button
              id="btn-scheme-b"
              type="button"
              className={`tb-btn ${scheme === 'scheme-b' ? 'active' : ''}`}
              onClick={() => setScheme('scheme-b')}
            >
              Scheme B: Eco-Green (Selected)
            </button>
          </div>

          <button
            type="button"
            className="tb-btn"
            style={{ background: '#334155', color: '#fff', borderRadius: '6px' }}
            onClick={() => setHistoryOpen((prev) => !prev)}
          >
            Version History (2 Members)
          </button>
        </div>
      </header>

      <div className="workspace">
        {/* LEFT 9-SCREEN TRACEABILITY SIDEBAR (2-MEMBER 4.5 SCREEN SPLIT) */}
        <aside className="sidebar">
          <div className="sidebar-group-title">Member A: Sofia Mironenko (4.5 Screens)</div>
          {memberAScreens.map((id) => {
            const item = SCREEN_META[id];
            const isActive = currentScreenId === id;
            return (
              <Link
                key={id}
                href={item.routePath}
                id={`nav-${id}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigateToScreen(id);
                }}
              >
                <div className="nav-item-top">
                  <span>{item.shortTitle}</span>
                  <div className="nav-badges">
                    <span className="nav-device-tag">{item.deviceTag}</span>
                    <span className="nav-req-badge">{item.reqBadge}</span>
                  </div>
                </div>
                <div className="nav-item-sub">{item.subText}</div>
              </Link>
            );
          })}

          <div className="sidebar-group-title member-b-hdr">Member B: Kim Le (4.5 Screens)</div>
          {memberBScreens.map((id) => {
            const item = SCREEN_META[id];
            const isActive = currentScreenId === id;
            return (
              <Link
                key={id}
                href={item.routePath}
                id={`nav-${id}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigateToScreen(id);
                }}
              >
                <div className="nav-item-top">
                  <span>{item.shortTitle}</span>
                  <div className="nav-badges">
                    <span className="nav-device-tag">{item.deviceTag}</span>
                    <span className="nav-req-badge">{item.reqBadge}</span>
                  </div>
                </div>
                <div className="nav-item-sub">{item.subText}</div>
              </Link>
            );
          })}
        </aside>

        {/* CENTER INTERACTIVE STAGE */}
        <main className="stage">
          <div className="device-mode-pill" id="form-factor-indicator">
            <span>Active Persona Viewport:</span>
            <span className="highlight" id="form-factor-text">
              {formFactorLabel}
            </span>
          </div>

          <div
            className={`device-frame ${isDesktopFrame ? 'desktop-frame' : ''}`}
            id="prototype-viewport"
          >
            {/* Browser Bar (Appears automatically on Desktop / Classroom Smartboard screens S6, S7, S8, S9) */}
            <div className="browser-chrome-bar">
              <div className="window-dots">
                <span className="w-dot r"></span>
                <span className="w-dot y"></span>
                <span className="w-dot g"></span>
              </div>
              <div className="browser-url-box">
                <span id="browser-url-text">{meta.url}</span>
                <span>🔒 Verified School Intranet SSL</span>
              </div>
            </div>

            {/* Top Status Bar */}
            <div className="device-statusbar">
              <span className="sla-pill">SLA: 0.38s Live Cloud Sync</span>
            </div>

            {/* App Header */}
            <div className="app-header">
              <div className="app-header-top">
                <div className="app-brand">
                  <span
                    className="school-logo"
                    role="img"
                    aria-label="Hartwell Primary School stag crest"
                  ></span>
                  <span className="school-title">
                    Hartwell Primary School — Sustainable Travel System
                  </span>
                </div>
              </div>
              <div className="screen-subtitle-bar"></div>
            </div>

            {/* Screen Body */}
            <div className="screen-body">
              {/* ==================== SCREEN S1 ==================== */}
              <div
                className={`screen-pane ${currentScreenId === 's1' ? 'active' : ''}`}
                id="pane-s1"
              >
                <div className="banner-success">
                  <span>
                    Active Morning Window: 08:15 AM – 09:00 AM School Zone Supervision
                  </span>
                  <span>Multi-Device SSO</span>
                </div>

                <div className="desktop-split">
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">1. Role-Based Persona Selector</span>
                      <span className="req-pill">UC-01 | REQ-SEC-01</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span>Select Authorised Persona Role (Mobile or Classroom PC)</span>
                        <span className="control-type-hint">[Segmented Control]</span>
                      </label>
                      <div className="segmented-control">
                        <button
                          type="button"
                          className="seg-btn"
                          onClick={() => router.push('/parent-login')}
                        >
                          Parent (PC/App)
                        </button>
                        <button type="button" className="seg-btn active">
                          Duty Assistant (App)
                        </button>
                        <button
                          type="button"
                          className="seg-btn"
                          onClick={() => router.push('/admin-login')}
                        >
                          Staff / Admin
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span>Staff / Carer Email Address</span>
                        <span className="control-type-hint">[Pre-filled Input]</span>
                      </label>
                      <input
                        type="text"
                        className="input-box"
                        value="s.mitchell@hartwellps.vic.edu.au"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">2. Dynamic Morning Shift OTP</span>
                      <span className="req-pill">REQ-SAF-01</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span>6-Digit Time-Bound Shift Code (08:15–09:00 AM)</span>
                        <span className="control-type-hint">[Numeric Mask]</span>
                      </label>
                      <div className="otp-row">
                        <div className="otp-digit">4</div>
                        <div className="otp-digit">8</div>
                        <div className="otp-digit">2</div>
                        <div className="otp-digit">-</div>
                        <div className="otp-digit">9</div>
                        <div className="otp-digit">1</div>
                        <div className="otp-digit">0</div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        textAlign: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      Matches <code>DutyRouteAssistant.dynamicOTP</code> — Expires automatically at
                      09:05 AM
                    </div>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => navigateToScreen('s2')}
                    >
                      Verify Shift OTP &amp; Open 500m Hub Check-In &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* ==================== SCREEN S2 ==================== */}
              <div
                className={`screen-pane ${currentScreenId === 's2' ? 'active' : ''}`}
                id="pane-s2"
              >
                <div className="banner-success">
                  <span>
                    Visibility of System Status (#1): Live Counter 14 / 15 Checked In
                  </span>
                  <span>0.38s SLA</span>
                </div>

                <div className="desktop-split">
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">Walk Session &amp; 500m Hub Selector</span>
                      <span className="req-pill">UC-02 | REQ-TRK-01</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span>Walk Commute Date</span>
                        <span className="control-type-hint">[Calendar Date Picker]</span>
                      </label>
                      <input
                        type="date"
                        className="input-box"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span>Assigned 500m Drop-Off Hub &amp; Walking Group</span>
                        <span className="control-type-hint">[Constrained Dropdown]</span>
                      </label>
                      <select
                        className="select-box"
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                      >
                        <option>
                          Group G-04: Toorak Rd / Hartwell East 500m Hub (08:15 AM)
                        </option>
                        <option>
                          Group G-02: Myrtle Park Greenway 500m Hub (08:20 AM)
                        </option>
                        <option>
                          Group G-01: Fordham Gardens 500m Hub (08:15 AM)
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">Live Telemetry &amp; Student Roll Call</span>
                      <span className="req-pill">Non-Smartphone RFID/QR</span>
                    </div>
                    <div className="metrics-grid" style={{ marginBottom: '10px' }}>
                      <div className="metric-box">
                        <div className="metric-val">1,840</div>
                        <div className="metric-lbl">Group Steps</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-val">1.35 km</div>
                        <div className="metric-lbl">Distance</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-val">14 / 15</div>
                        <div className="metric-lbl">Checked In</div>
                      </div>
                    </div>

                    <div className="roster-row">
                      <span>1. Leo Mitchell (STU-1042, Yr 4B) — Bag Tag QR</span>
                      <span className="status-pill-ok">08:22 AM Checked In</span>
                    </div>
                    <div className="roster-row">
                      <span>2. Maya Chen (STU-1088, Yr 4B) — Bag Tag QR</span>
                      <span className="status-pill-ok">08:23 AM Checked In</span>
                    </div>
                    <div className="roster-row">
                      <span>15. Noah Patel (STU-1104, Yr 3A) — Unaccounted</span>
                      <span className="status-pill-warn">Pending @ 08:59 AM</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigateToScreen('s3')}
                  >
                    View 9AM Escalation &rarr;
                  </button>
                  <button
                    type="button"
                    className="btn-danger-outline"
                    onClick={() => navigateToScreen('s3', true)}
                  >
                    End Walk / 9AM SOS
                  </button>
                </div>
              </div>

              {/* ==================== SCREEN S3 ==================== */}
              <div
                className={`screen-pane ${currentScreenId === 's3' ? 'active' : ''}`}
                id="pane-s3"
              >
                <div className="banner-crimson">
                  {sosDispatchedBanner
                    ? '✓ 9:00 AM SOS SMS Dispatched to Guardians & Admin for Noah Patel (STU-1104)'
                    : '9:00 AM Gate Cutoff Alert: 1 Student (Noah Patel, STU-1104) Unaccounted on Group G-04'}
                </div>

                <div className="desktop-split">
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">9:00 AM Escalation &amp; SOS Trigger</span>
                      <span className="req-pill">UC-03 | REQ-SAF-02</span>
                    </div>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        marginBottom: '10px',
                      }}
                    >
                      Peer Review Fix (Member B &rarr; Sofia M.): Restyled destructive trigger in
                      high-contrast crimson and added a mandatory 2-step confirmation modal to
                      prevent false parent panic.
                    </p>
                    <button
                      type="button"
                      className="btn-danger-outline"
                      onClick={() => setModalOpen(true)}
                    >
                      Trigger 9:00 AM Unaccounted Student SOS Alert &amp; End Walk
                    </button>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">
                        Walk Summary &amp; Sustainability Report
                      </span>
                      <span className="req-pill">UC-03 | REQ-TRK-02</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span>Report Date Range</span>
                        <span className="control-type-hint">[Date Range Picker]</span>
                      </label>
                      <input
                        type="text"
                        className="input-box"
                        value="01/10/2026 to 02/11/2026"
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span>Student Lookup Filter</span>
                        <span className="control-type-hint">[Auto-Complete Search]</span>
                      </label>
                      <input
                        type="text"
                        className="input-box"
                        value="Leo Mitchell (STU-1042, Year 4B)"
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span>Export Format</span>
                        <span className="control-type-hint">[Radio Buttons]</span>
                      </label>
                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          display: 'flex',
                          gap: '14px',
                        }}
                      >
                        <span
                          style={{ cursor: 'pointer' }}
                          onClick={() => setExportFormat('pdf')}
                        >
                          ({exportFormat === 'pdf' ? '•' : ' '}) PDF Official Summary
                        </span>
                        <span
                          style={{ cursor: 'pointer' }}
                          onClick={() => setExportFormat('csv')}
                        >
                          ({exportFormat === 'csv' ? '•' : ' '}) CSV Dataset
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================== SCREEN S4 ==================== */}
              <div
                className={`screen-pane ${currentScreenId === 's4' ? 'active' : ''}`}
                id="pane-s4"
              >
                <div className="banner-amber">
                  BOM Weather Squall Alert: Heavy Rain (80% Precip) &amp; Standing Water on
                  Corridor C-01
                </div>

                <div className="desktop-split">
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">Live BOM &amp; VicRoads Corridor Feed</span>
                      <span className="req-pill">UC-04 | REQ-ENV-01</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span>Monitored School Walking Corridor</span>
                        <span className="control-type-hint">[Corridor Dropdown]</span>
                      </label>
                      <select
                        className="select-box"
                        value={selectedCorridor}
                        onChange={(e) => setSelectedCorridor(e.target.value)}
                      >
                        <option>Corridor C-01: Toorak Rd / Camberwell Rd Crossing</option>
                        <option>Corridor C-02: Myrtle Park Greenway Path</option>
                        <option>Corridor C-03: Fordham Rd Signalised Crossing</option>
                      </select>
                    </div>

                    <div className="metrics-grid" style={{ margin: '10px 0' }}>
                      <div className="metric-box">
                        <div className="metric-val">16&deg;C</div>
                        <div className="metric-lbl">BOM Temp</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-val" style={{ color: '#B91C1C' }}>
                          80% Rain
                        </div>
                        <div className="metric-lbl">Squall Risk</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-val" style={{ color: '#D97706' }}>
                          Blocked
                        </div>
                        <div className="metric-lbl">VicRoads Status</div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">Severity &amp; Action Dispatch</span>
                      <span className="req-pill">Real-Time Telemetry</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span>Hazard Severity Classification</span>
                        <span className="control-type-hint">[Segmented Control]</span>
                      </label>
                      <div className="segmented-control">
                        <button
                          type="button"
                          className={`seg-btn ${hazardSeverity === 'normal' ? 'active' : ''}`}
                          onClick={() => setHazardSeverity('normal')}
                        >
                          Normal
                        </button>
                        <button
                          type="button"
                          className={`seg-btn ${hazardSeverity === 'caution' ? 'active' : ''}`}
                          onClick={() => setHazardSeverity('caution')}
                        >
                          Caution
                        </button>
                        <button
                          type="button"
                          className={`seg-btn ${hazardSeverity === 'severe' ? 'active' : ''}`}
                          onClick={() => setHazardSeverity('severe')}
                        >
                          Severe Detour
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ marginTop: '8px' }}
                      onClick={() => navigateToScreen('s5')}
                    >
                      Open Client Change CR-01 Alternate Hub Override (S5) &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* ==================== SCREEN S5 (CR-01 — CO-OWNED 0.5 / 0.5) ==================== */}
              <div
                className={`screen-pane ${currentScreenId === 's5' ? 'active' : ''}`}
                id="pane-s5"
              >
                <div className="banner-amber">
                  CLIENT CHANGE REQUEST CR-01: Corridor C-01 Blocked — Select Pre-Vetted Safe
                  Detour
                </div>

                <div className="desktop-split">
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">
                        Constrained Alternate Route &amp; 500m Hub
                      </span>
                      <span className="req-pill">UC-05 | REQ-ENV-02 (CR-01)</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span>Verified Alternate 500m Hub &amp; Corridor</span>
                        <span className="control-type-hint">
                          [Constrained Dropdown — Peer Fix by Sofia M.]
                        </span>
                      </label>
                      <select
                        className="select-box"
                        value={selectedAlternateRoute}
                        onChange={(e) => setSelectedAlternateRoute(e.target.value)}
                      >
                        <option>
                          Route B: Myrtle Park Greenway 500m Hub (+4 mins | Sheltered)
                        </option>
                        <option>Route C: Fordham Gardens Signalised Path (+6 mins)</option>
                        <option>Hold at Primary Shelter Hub H-01 (Wait 10 mins)</option>
                      </select>
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        marginBottom: '8px',
                      }}
                    >
                      Replaces error-prone free-text street input identified during Sofia M.&apos;s
                      Peer Usability Walkthrough.
                    </div>

                    <div className="toggle-row">
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700 }}>
                          1:1 Mobility &amp; Vision Support Check
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          Verify accessible kerb ramps on Myrtle Park detour
                        </div>
                      </div>
                      <span className="toggle-pill">[CONFIRMED 1:1]</span>
                    </div>

                    <div className="toggle-row">
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700 }}>
                          Broadcast Instant CR-01 Detour Alert
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          Push live ETA (+4 mins) to enrolled parents on S7
                        </div>
                      </div>
                      <span className="toggle-pill">[ON — AUTO PUSH]</span>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">
                        Detour Safety Verification (Shared 0.5/0.5 Bridge)
                      </span>
                      <span className="req-pill">Zero Road Crossing Risk</span>
                    </div>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        marginBottom: '12px',
                      }}
                    >
                      Co-integrated by Sofia M. (S4 Hazard Trigger &amp; Constrained Dropdown Fix)
                      and Member B (S7 Parent Broadcast Link).
                    </p>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => navigateToScreen('s6')}
                    >
                      Activate Route B Detour &amp; Proceed to Hub Roll Call (S6) &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* ==================== SCREEN S6 (ADMIN/TEACHER TABLET & PC) ==================== */}
              <div
                className={`screen-pane ${currentScreenId === 's6' ? 'active' : ''}`}
                id="pane-s6"
              >
                <div className="banner-success">
                  <span>
                    12/12 Students Checked In at 08:47 AM — Myrtle Park 500m Radial Drop-Off Zone
                  </span>
                  <span>Teacher / Admin Dashboard</span>
                </div>

                <div className="desktop-split">
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">500m Hub Roll Call Verification</span>
                      <span className="req-pill">UC-06 | REQ-TRK-03</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span>Active Drop-Off Hub</span>
                        <span className="control-type-hint">[Constrained Dropdown]</span>
                      </label>
                      <select
                        className="select-box"
                        defaultValue="Hub H-02: Myrtle Park 500m Radial Drop-Off Zone"
                      >
                        <option>Hub H-02: Myrtle Park 500m Radial Drop-Off Zone</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span>Gate Arrival Check-In Timestamp</span>
                        <span className="control-type-hint">[Auto-Filled Time Picker]</span>
                      </label>
                      <input
                        type="text"
                        className="input-box"
                        value="08:47 AM (Verified via School Gate RFID/QR Beacon)"
                        readOnly
                      />
                    </div>
                    <div className="roster-row">
                      <span>Group G-02 Roster (12/12 Checked In)</span>
                      <span className="status-pill-ok">100% Arrived Safe</span>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">
                        School Gate Congestion &amp; Walking KPIs
                      </span>
                      <span className="req-pill">Victoria Walks Target</span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                      Active Walking Mode Share: 39% Baseline &rarr;{' '}
                      <span style={{ color: 'var(--primary)' }}>48.5% Current (Target: 51%)</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: '88%' }}></div>
                    </div>
                    <div className="metrics-grid" style={{ marginTop: '10px' }}>
                      <div className="metric-box">
                        <div className="metric-val">-34%</div>
                        <div className="metric-lbl">Gate Cars</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-val">142 kg</div>
                        <div className="metric-lbl">CO2 Saved</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-val">100%</div>
                        <div className="metric-lbl">Arrived Safe</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================== SCREEN S7 (PARENT WEB PORTAL / MOBILE APP) ==================== */}
              <div
                className={`screen-pane ${currentScreenId === 's7' ? 'active' : ''}`}
                id="pane-s7"
              >
                <div className="banner-success">
                  <span>
                    08:46 AM Safe Arrival Banner: Leo Mitchell Checked In at School Gate
                  </span>
                  <span>Parent Desktop Web &amp; Mobile Portal</span>
                </div>

                <div className="desktop-split">
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">
                        Parental Live Geofence &amp; Sibling Portal
                      </span>
                      <span className="req-pill">UC-07 | REQ-PAR-01</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span>Enrolled Child Selector (1..* Multiplicity)</span>
                        <span className="control-type-hint">[Sibling Dropdown]</span>
                      </label>
                      <select
                        className="select-box"
                        value={selectedChild}
                        onChange={(e) => setSelectedChild(e.target.value)}
                      >
                        <option>Leo Mitchell (Year 4B) — Active on Route B Detour</option>
                        <option>Sophie Mitchell (Year 1A) — Arrived Gate 2 (08:44 AM)</option>
                      </select>
                    </div>

                    <div className="map-box">
                      <div className="map-corridor-line"></div>
                      <span className="map-pin">
                        Inside 500m Safe Corridor — Myrtle Park Greenway
                      </span>
                      <div
                        style={{
                          background: 'rgba(255,255,255,0.94)',
                          padding: '6px 9px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#111827',
                          zIndex: 2,
                        }}
                      >
                        CR-01 Detour Active: Diverted from Toorak Rd Squall (+4 mins)
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">
                        Guardian Verification &amp; Quick Actions
                      </span>
                      <span className="req-pill">Zero Child Phone Needed</span>
                    </div>
                    <div className="roster-row">
                      <span>Gate Beacon Check-In:</span>
                      <span className="status-pill-ok">Verified 08:46 AM</span>
                    </div>
                    <div className="roster-row">
                      <span>SMS Fallback Notification:</span>
                      <span className="status-pill-ok">Sent to 0412 *** 890</span>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        marginTop: '10px',
                      }}
                    >
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => navigateToScreen('s8')}
                      >
                        View Classroom Leaderboard (S8)
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ background: 'var(--secondary)' }}
                        onClick={() => navigateToScreen('s2')}
                      >
                        Call Duty Assistant
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================== SCREEN S8 (CLASSROOM SMARTBOARD GAMIFICATION + PRIVACY) ==================== */}
              <div
                className={`screen-pane ${currentScreenId === 's8' ? 'active' : ''}`}
                id="pane-s8"
              >
                {/* Teacher Classroom Smartboard / Whiteboard Banner */}
                <div className="whiteboard-hero">
                  <div>
                    <div
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        color: '#FDE047',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      💻 Classroom Interactive Whiteboard Mode (Projected by Teacher in Homeroom)
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 900, marginTop: '2px' }}>
                      🏆 Walking Wednesday &amp; Golden Boot Trophy Leaderboard
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#FDE047' }}>
                      Term 4 — Week 5
                    </div>
                    <div style={{ fontSize: '10.5px', opacity: 0.9 }}>
                      Zero Individual Student GPS Shown on Board
                    </div>
                  </div>
                </div>

                <div className="desktop-split">
                  {/* Left Column: Classroom Whiteboard Gamification Podium & Badges */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">
                        Homeroom Active Travel Podium (Classroom Smartboard)
                      </span>
                      <span className="req-pill">Gamification &amp; Engagement</span>
                    </div>

                    <div className="trophy-podium-grid">
                      <div className="podium-card first-place">
                        <div className="podium-medal">🥇 🥾</div>
                        <div className="podium-class">1st: Year 4B</div>
                        <div className="podium-rate">86% Walked</div>
                        <div className="podium-sub">Ms. Lin | Golden Boot Winner!</div>
                      </div>
                      <div className="podium-card">
                        <div className="podium-medal">🥈</div>
                        <div className="podium-class">2nd: Year 5A</div>
                        <div className="podium-rate">79% Walked</div>
                        <div className="podium-sub">Mr. Davis | 24/30 Students</div>
                      </div>
                      <div className="podium-card">
                        <div className="podium-medal">🥉</div>
                        <div className="podium-class">3rd: Year 3B</div>
                        <div className="podium-rate">74% Walked</div>
                        <div className="podium-sub">Ms. Carter | 20/27 Students</div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: 'var(--primary)',
                        marginTop: '10px',
                      }}
                    >
                      Unlocked Class Sustainability Milestones (Projected for Students):
                    </div>
                    <div className="badges-strip">
                      <div className="eco-badge-card">
                        <span className="eco-badge-icon">🌳</span>
                        <div className="eco-badge-info">
                          142 kg CO2 Saved
                          <br />
                          <span style={{ fontWeight: 500 }}>= 7 Trees Planted</span>
                        </div>
                      </div>
                      <div className="eco-badge-card">
                        <span className="eco-badge-icon">⛈</span>
                        <div className="eco-badge-info">
                          Storm Trooper Badge
                          <br />
                          <span style={{ fontWeight: 500 }}>Myrtle Park Detour</span>
                        </div>
                      </div>
                      <div className="eco-badge-card">
                        <span className="eco-badge-icon">⭐</span>
                        <div className="eco-badge-info">
                          5-Week Streak
                          <br />
                          <span style={{ fontWeight: 500 }}>House Points +250</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Technoethical Privacy & GPS Consent Manager (UC-08) */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">Time-Bounded Location Privacy Manager</span>
                      <span className="req-pill">UC-08 | REQ-ETH-01 (APP 1/6)</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span>Permitted Telemetry Tracking Window</span>
                        <span className="control-type-hint">
                          [Constrained Schedule — Peer Fix by Sofia M.]
                        </span>
                      </label>
                      <select
                        className="select-box"
                        value={selectedTrackingWindow}
                        onChange={(e) => setSelectedTrackingWindow(e.target.value)}
                      >
                        <option>
                          Active ONLY 08:00–09:00 AM &amp; 03:15–04:15 PM (School Commute)
                        </option>
                        <option>Gate Check-In Beacon Only (Zero En-Route GPS)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span>Raw Telemetry Auto-Purge Policy</span>
                        <span className="control-type-hint">[Retention Dropdown]</span>
                      </label>
                      <select
                        className="select-box"
                        defaultValue="Purge Raw GPS Logs Every 7 Days (APP 6 Minimisation)"
                      >
                        <option>Purge Raw GPS Logs Every 7 Days (APP 6 Minimisation)</option>
                      </select>
                    </div>
                    <div className="toggle-row">
                      <div>
                        <div style={{ fontSize: '11.5px', fontWeight: 700 }}>
                          Whiteboard Anonymization Guard
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          Show class % totals only on classroom smartboard
                        </div>
                      </div>
                      <span className="toggle-pill locked">[CLASS % ONLY]</span>
                    </div>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ marginTop: '8px' }}
                      onClick={() => navigateToScreen('s9')}
                    >
                      Open Council Export &amp; WCAG Settings (S9) &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* ==================== SCREEN S9 (ADMIN PC COUNCIL EXPORT & ACCESSIBILITY) ==================== */}
              <div
                className={`screen-pane ${currentScreenId === 's9' ? 'active' : ''}`}
                id="pane-s9"
              >
                <div className="banner-success">
                  <span>
                    Preferences Updated Successfully — Boroondara Council Dataset Anonymized
                  </span>
                  <span>Admin &amp; Parent Web Portal</span>
                </div>

                <div className="desktop-split">
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">
                        Council Dataset Export &amp; Locked PII Guard
                      </span>
                      <span className="req-pill">UC-09 | APP 6 Ethics</span>
                    </div>
                    <div className="toggle-row">
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700 }}>
                          Mandatory PII Anonymization (Strip Names/IDs)
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          Peer Review Fix (Sofia M. &rarr; Member B): Locked ON to prevent APP 6
                          breach
                        </div>
                      </div>
                      <span className="toggle-pill locked">[LOCKED ON — APP 6]</span>
                    </div>
                    <div className="toggle-row">
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700 }}>
                          Statutory Archive Retention Rule
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          Aggregated non-identifiable count archive
                        </div>
                      </div>
                      <span className="toggle-pill">7-Year Archive</span>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">
                        WCAG 2.2 AAA Accessibility &amp; SMS Parity
                      </span>
                      <span className="req-pill">UC-09 | REQ-ACC-01</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span>Interface Typography Scaling Slider</span>
                        <span className="control-type-hint">[100% — 125% — 150%]</span>
                      </label>
                      <div className="segmented-control">
                        <button
                          type="button"
                          className={`seg-btn ${fontScale === '100' ? 'active' : ''}`}
                          onClick={() => setFontScale('100')}
                        >
                          100% Default
                        </button>
                        <button
                          type="button"
                          className={`seg-btn ${fontScale === '125' ? 'active' : ''}`}
                          onClick={() => setFontScale('125')}
                        >
                          125% Large (Active)
                        </button>
                        <button
                          type="button"
                          className={`seg-btn ${fontScale === '150' ? 'active' : ''}`}
                          onClick={() => setFontScale('150')}
                        >
                          150% Extra High
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span>Multi-Channel Alert Equity (No-Smartphone Parity)</span>
                        <span className="control-type-hint">[Checkboxes]</span>
                      </label>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          display: 'flex',
                          gap: '12px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{ cursor: 'pointer' }}
                          onClick={() =>
                            setChannels((prev) => ({ ...prev, push: !prev.push }))
                          }
                        >
                          [{channels.push ? 'x' : ' '}] App Push
                        </span>
                        <span
                          style={{ cursor: 'pointer' }}
                          onClick={() =>
                            setChannels((prev) => ({ ...prev, sms: !prev.sms }))
                          }
                        >
                          [{channels.sms ? 'x' : ' '}] Two-Way SMS (No-App Parity)
                        </span>
                        <span
                          style={{ cursor: 'pointer' }}
                          onClick={() =>
                            setChannels((prev) => ({ ...prev, email: !prev.email }))
                          }
                        >
                          [{channels.email ? 'x' : ' '}] Email
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================== TWO-STEP CONFIRMATION MODAL (ERROR PREVENTION #5) ==================== */}
            <div className={`modal-backdrop ${modalOpen ? 'open' : ''}`} id="sos-modal">
              <div className="modal-card">
                <span className="modal-badge">Nielsen Heuristic #5: Error Prevention</span>
                <div className="modal-title">
                  Confirm 9:00 AM Absence SOS &amp; Walk Termination?
                </div>
                <div className="modal-desc">
                  You are about to dispatch an immediate{' '}
                  <strong>9:00 AM Unaccounted Student SMS Alert</strong> for{' '}
                  <strong>Noah Patel (STU-1104)</strong> to Guardians &amp; School Admin and close
                  Group G-04 roll call.
                  <br />
                  <br />
                  <em>
                    Added following Member B&apos;s Peer Usability Test on Sofia M.&apos;s screen
                    to prevent single-tap accidental parent panic in wet roadside conditions.
                  </em>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel (Keep Walk Active)
                  </button>
                  <button
                    type="button"
                    className="btn-confirm-sos"
                    onClick={() => {
                      setSosDispatchedBanner(true);
                      setModalOpen(false);
                    }}
                  >
                    Confirm &amp; Dispatch 9AM SMS
                  </button>
                </div>
              </div>
            </div>

            {/* ==================== SETTINGS SHEET & LOGOUT MODAL ==================== */}
            <div
              className={`settings-backdrop ${settingsOpen ? 'open' : ''}`}
              id="settings-panel"
              onClick={(e) => {
                if ((e.target as HTMLElement).id === 'settings-panel') {
                  setSettingsOpen(false);
                }
              }}
            >
              <section
                className="settings-sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-title"
              >
                <div
                  id="settings-main"
                  style={{ display: accountDetailsOpen ? 'none' : undefined }}
                >
                  <div className="settings-header">
                    <div>
                      <div className="settings-kicker">Preferences</div>
                      <h2 className="settings-title" id="settings-title">
                        Settings
                      </h2>
                    </div>
                    <button
                      className="settings-close"
                      type="button"
                      onClick={() => setSettingsOpen(false)}
                      aria-label="Close settings"
                    >
                      &times;
                    </button>
                  </div>

                  <div className="account-summary">
                    <div className="account-avatar" aria-hidden="true">
                      {activeUser.initials}
                    </div>
                    <div>
                      <div className="account-summary-name">{activeUser.name}</div>
                      <div className="account-summary-role">{activeUser.roleLabel}</div>
                    </div>
                  </div>

                  <div className="settings-list">
                    <div className="settings-row">
                      <div className="settings-row-copy">
                        <strong>High contrast</strong>
                        <span>Increase colour and border contrast</span>
                      </div>
                      <button
                        className="settings-switch"
                        id="contrast-toggle"
                        type="button"
                        aria-label="High contrast"
                        aria-pressed={highContrast}
                        onClick={() => setHighContrast((prev) => !prev)}
                      ></button>
                    </div>
                    <div className="settings-row">
                      <div className="settings-row-copy">
                        <strong>Bigger text</strong>
                        <span>Enlarge text across the app</span>
                      </div>
                      <button
                        className="settings-switch"
                        id="text-size-toggle"
                        type="button"
                        aria-label="Bigger text"
                        aria-pressed={largeText}
                        onClick={() => setLargeText((prev) => !prev)}
                      ></button>
                    </div>
                    <button
                      className="settings-row"
                      type="button"
                      onClick={() => setAccountDetailsOpen(true)}
                    >
                      <span className="settings-row-copy">
                        <strong>Account</strong>
                        <span>View your profile and access level</span>
                      </span>
                      <span className="settings-chevron" aria-hidden="true">
                        &rsaquo;
                      </span>
                    </button>
                    <button
                      className="settings-row settings-logout"
                      type="button"
                      onClick={() => {
                        setLogoutConfirmed(false);
                        setLogoutModalOpen(true);
                      }}
                    >
                      <span className="settings-row-copy">
                        <strong>Log out</strong>
                        <span>Sign out of this device</span>
                      </span>
                      <span className="settings-chevron" aria-hidden="true">
                        &rsaquo;
                      </span>
                    </button>
                  </div>
                </div>

                <div
                  className={`account-details ${accountDetailsOpen ? 'open' : ''}`}
                  id="account-details"
                >
                  <button
                    className="account-back"
                    type="button"
                    onClick={() => setAccountDetailsOpen(false)}
                  >
                    &larr; Back to settings
                  </button>
                  <div className="settings-header">
                    <div>
                      <div className="settings-kicker">Your profile</div>
                      <h2 className="settings-title">Account</h2>
                    </div>
                  </div>
                  <div className="account-detail-card">
                    <div>
                      <div className="account-detail-label">Name</div>
                      <div className="account-detail-value">{activeUser.name}</div>
                    </div>
                    <div>
                      <div className="account-detail-label">Email</div>
                      <div className="account-detail-value">{activeUser.email}</div>
                    </div>
                    <div>
                      <div className="account-detail-label">Role</div>
                      <div className="account-detail-value">{activeUser.roleLabel}</div>
                    </div>
                    <div>
                      <div className="account-detail-label">Access</div>
                      <div className="account-detail-value">{activeUser.accessSummary}</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className={`modal-backdrop ${logoutModalOpen ? 'open' : ''}`} id="logout-modal">
              <div
                className="modal-card logout-card"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="logout-title"
              >
                <div className="modal-title" id="logout-title">
                  {logoutConfirmed ? 'You are logged out' : 'Log out of this device?'}
                </div>
                <div className="modal-desc" id="logout-description">
                  {logoutConfirmed
                    ? 'Your session has ended safely on this device.'
                    : 'You will need to sign in again to access school travel information.'}
                </div>
                <div
                  className="modal-actions"
                  id="logout-actions"
                  style={{ gridTemplateColumns: logoutConfirmed ? '1fr' : undefined }}
                >
                  <button
                    className="btn-cancel"
                    id="logout-cancel"
                    type="button"
                    onClick={() => setLogoutModalOpen(false)}
                  >
                    {logoutConfirmed ? 'Done' : 'Cancel'}
                  </button>
                  {!logoutConfirmed && (
                    <button
                      className="btn-confirm-logout"
                      id="logout-confirm"
                      type="button"
                      onClick={() => {
                        try {
                          sessionStorage.removeItem('hartwell_demo_user');
                        } catch {
                          // ignore
                        }
                        setLogoutConfirmed(true);
                        setSettingsOpen(false);
                      }}
                    >
                      Log out
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Persistent 6-Tab Bottom Navigation Bar */}
            <nav className="bottom-nav">
              <Link
                href="/s1"
                className={`tab-btn ${
                  !settingsOpen && ['s1', 's2', 's3'].includes(currentScreenId) ? 'active' : ''
                }`}
                id="tab-home"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToScreen('s1');
                }}
              >
                <span>🔒</span>
                <span> Track</span>
              </Link>
              <Link
                href="/s4"
                className={`tab-btn ${
                  !settingsOpen && currentScreenId === 's4' ? 'active' : ''
                }`}
                id="tab-weather"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToScreen('s4');
                }}
              >
                <span>⛈</span>
                <span> Weather</span>
              </Link>
              <Link
                href="/s5"
                className={`tab-btn ${
                  !settingsOpen && currentScreenId === 's5' ? 'active' : ''
                }`}
                id="tab-reroute"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToScreen('s5');
                }}
              >
                <span>⚠</span>
                <span>Reroute</span>
              </Link>
              <Link
                href="/s7"
                className={`tab-btn ${
                  !settingsOpen && ['s6', 's7'].includes(currentScreenId) ? 'active' : ''
                }`}
                id="tab-parent"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToScreen('s7');
                }}
              >
                <span>📍</span>
                <span> Parent PC/App</span>
              </Link>
              <Link
                href="/s8"
                className={`tab-btn ${
                  !settingsOpen && ['s8', 's9'].includes(currentScreenId) ? 'active' : ''
                }`}
                id="tab-privacy"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToScreen('s8');
                }}
              >
                <span>🏆</span>
                <span> Whiteboard</span>
              </Link>
              <button
                className={`tab-btn ${settingsOpen ? 'active' : ''}`}
                id="tab-settings"
                type="button"
                aria-controls="settings-panel"
                aria-expanded={settingsOpen}
                onClick={() => {
                  if (settingsOpen) {
                    setSettingsOpen(false);
                  } else {
                    setAccountDetailsOpen(false);
                    setSettingsOpen(true);
                  }
                }}
              >
                <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"></path>
                </svg>
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </main>

        {/* RIGHT DRAWER: FIGMA VERSION HISTORY & ATTRIBUTION (2 MEMBERS EQUAL: 4.5 SCREENS EACH) */}
        <aside
          className={`version-history-drawer ${historyOpen ? 'open' : ''}`}
          id="history-drawer"
        >
          <div className="vh-header">
            <span className="vh-title">Figma Version History &amp; Attribution</span>
            <span style={{ fontSize: '11px', color: '#4ADE80', fontWeight: 700 }}>
              2 Members Equal (4.5/4.5)
            </span>
          </div>

          <div className="vh-item">
            <div className="vh-version-tag">
              <span>v2.4 — Peer Review Fixes &amp; S1–S4</span>
              <span className="vh-time">06 Nov, 18:40</span>
            </div>
            <div className="vh-author">
              Sofia Mironenko (Member A — S1, S2, S3, S4 + 0.5 S5)
            </div>
            <div className="vh-desc">
              Implemented 2-step SOS confirmation modal on S3/S2 (after Member B&apos;s peer test)
              &amp; replaced free-text detour with constrained 500m Hub dropdown on S5.
            </div>
          </div>

          <div className="vh-item member-b">
            <div className="vh-version-tag">
              <span>v2.3 — Smartboard S8, S6–S9 &amp; CR-01</span>
              <span className="vh-time">06 Nov, 16:15</span>
            </div>
            <div className="vh-author">Kim Le (Partner — 0.5 S5 + S6, S7, S8, S9)</div>
            <div className="vh-desc">
              Built S6 Hub Roll Call &amp; KPIs, S7 Parent Geofence Portal, S8 Classroom
              Smartboard Golden Boot Leaderboard + 08:00–09:00 AM GPS window, and S9 Locked PII
              toggle.
            </div>
          </div>

          <div className="vh-item co-owned">
            <div className="vh-version-tag">
              <span>v2.2 — Client Change Request CR-01 (S5)</span>
              <span className="vh-time">05 Nov, 20:10</span>
            </div>
            <div className="vh-author">Sofia Mironenko + Kim Le (Co-Owned S5 Bridge)</div>
            <div className="vh-desc">
              Connected Sofia M.&apos;s S4 BOM Weather Squall trigger to S5 Myrtle Park Greenway
              500m Hub override and Member B&apos;s S7 Live Parent Map alert.
            </div>
          </div>

          <div className="vh-item">
            <div className="vh-version-tag">
              <span>v2.0 — Client Colour Scheme B Swap</span>
              <span className="vh-time">04 Nov, 14:30</span>
            </div>
            <div className="vh-author">Sofia Mironenko + Kim Le (Client: Akrati Jain)</div>
            <div className="vh-desc">
              Swapped global design tokens from Scheme A (#1E3A8A Navy) to Client-Selected Scheme
              B (#1B5E20 Eco-Safe Green, 11.4:1 AAA) across all 9 screens in &lt;10s.
            </div>
          </div>

          <div className="vh-item member-b">
            <div className="vh-version-tag">
              <span>v1.0 — Initial SRS Baseline (4.5 Screens Each)</span>
              <span className="vh-time">02 Nov, 11:00</span>
            </div>
            <div className="vh-author">Sofia Mironenko (4.5) &amp; Kim Le (4.5)</div>
            <div className="vh-desc">
              Established shared Auto-Layout master navigation bar and equal 2-member attribution
              across UC-01 through UC-09.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
