'use client';

import React, { useState, useEffect, useRef } from 'react';
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

const REAL_SITE_TITLES: Record<ScreenId, string> = {
  s1: 'Morning Sign In',
  s2: '500m Hub Check-In',
  s3: 'Attendance & Alerts',
  s4: 'Weather & Corridors',
  s5: 'Safe Detour Routing',
  s6: 'Hub Roll Call & KPIs',
  s7: 'Live Family Geofence',
  s8: 'Walking Trophy Board',
  s9: 'Council Reporting',
};

interface PrototypeWorkspaceProps {
  initialScreen?: ScreenId;
}

export default function PrototypeWorkspace({ initialScreen = 's1' }: PrototypeWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentScreenId, setCurrentScreenId] = useState<ScreenId>(initialScreen);
  const [viewMode, setViewMode] = useState<'real-site' | 'figma-canvas'>('real-site');
  const [showRubricTags, setShowRubricTags] = useState<boolean>(false);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('auto');
  const [scheme, setScheme] = useState<ColorScheme>('scheme-b');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [historyOpen, setHistoryOpen] = useState<boolean>(true);
  const [sosDispatchedBanner, setSosDispatchedBanner] = useState<boolean>(false);

  // Settings & accessibility drawer state
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [accountDetailsOpen, setAccountDetailsOpen] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [largeText, setLargeText] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [srAnnouncement, setSrAnnouncement] = useState<string>('');
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [unreadNotifs, setUnreadNotifs] = useState<number>(3);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mapViewMode, setMapViewMode] = useState<'corridor' | 'google-maps'>('corridor');
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const downloadCouncilAuditCsv = () => {
    const csvRows = [
      ['Date', 'Student_ID', 'Student_Name', 'Grade', 'Corridor_Route', 'Hub_Checkin_Location', 'Checkin_Time', 'Distance_Walked_KM', 'Carbon_Saved_KG', 'Supervisor_Staff'],
      ['2026-11-06', 'STU-1042', 'Leo Mitchell', 'Year 4B', 'Route B (Myrtle Park)', 'Fordham Gardens Hub', '08:41:22', '1.35', '0.28', 'Ms. Lin'],
      ['2026-11-06', 'STU-1043', 'Sophie Mitchell', 'Year 1A', 'Route A (Toorak Rd)', 'Gate 2 Main Entrance', '08:44:10', '0.85', '0.18', 'Duty Asst. John'],
      ['2026-11-06', 'STU-1044', 'Oliver Zhang', 'Year 3A', 'Route B (Myrtle Park)', 'Myrtle Park East Hub', '08:38:05', '1.20', '0.25', 'Duty Asst. Sarah'],
      ['2026-11-06', 'STU-1045', 'Charlotte Brown', 'Year 2B', 'Route C (Hartwell Stn)', 'Hartwell Station Hub', '08:42:50', '1.10', '0.23', 'Ms. Lin'],
      ['2026-11-06', 'STU-1046', 'Noah Patel', 'Year 3A', 'Route A (Toorak Rd)', 'Toorak Rd Hub', '08:52:15', '0.95', '0.20', 'Duty Asst. John'],
      ['2026-11-06', 'STU-1047', 'Mia Watson', 'Prep A', 'Route B (Myrtle Park)', 'Fordham Gardens Hub', '08:40:02', '1.35', '0.28', 'Duty Asst. Sarah'],
      ['2026-11-06', 'STU-1048', 'Lucas Nguyen', 'Year 5C', 'Route C (Hartwell Stn)', 'Hartwell Station Hub', '08:35:18', '1.60', '0.33', 'Kim Le (Admin)'],
    ];
    const csvContent = csvRows.map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `hartwell_boroondara_travel_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('📥 Boroondara Council Travel Audit (CSV) downloaded successfully');
  };

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
      const savedMode = sessionStorage.getItem('hartwell_view_mode');
      if (savedMode === 'real-site' || savedMode === 'figma-canvas') {
        setViewMode(savedMode);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const updateViewMode = (mode: 'real-site' | 'figma-canvas') => {
    setViewMode(mode);
    try {
      sessionStorage.setItem('hartwell_view_mode', mode);
    } catch {
      // ignore
    }
  };

  // Interactive form states for enhanced prototype realism while preserving exact defaults
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-02');
  const [selectedGroup, setSelectedGroup] = useState<string>(
    'Group G-04: Toorak Rd / Hartwell East 500m Hub (08:15 AM)'
  );
  const [rosterFilter, setRosterFilter] = useState<'all' | 'pending' | 'checked'>('all');
  const [noahCheckedIn, setNoahCheckedIn] = useState<boolean>(false);
  const [earlyHandoffMaya, setEarlyHandoffMaya] = useState<boolean>(false);
  const [sosChannels, setSosChannels] = useState<{ sms: boolean; email: boolean }>({
    sms: true,
    email: true,
  });
  const [mobilitySupportVerified, setMobilitySupportVerified] = useState<boolean>(true);
  const [autoPushDetour, setAutoPushDetour] = useState<boolean>(true);
  const [s6CheckedStudents, setS6CheckedStudents] = useState<{ [id: string]: boolean }>({
    'leo': true,
    'maya': true,
    'lucas': true,
  });
  const [s9DateRange, setS9DateRange] = useState<string>('Term 4: 01/10/2026 – 02/11/2026');
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

  // Sync with prop & URL query parameters (?screen=s8&scheme=scheme-b&vp=desktop&modal=1&view=figma)
  useEffect(() => {
    setCurrentScreenId(initialScreen);
  }, [initialScreen]);

  useEffect(() => {
    const qScreen = searchParams.get('screen');
    const qScheme = searchParams.get('scheme');
    const qVp = searchParams.get('vp');
    const qModal = searchParams.get('modal');
    const qView = searchParams.get('view');

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
    if (qView === 'figma' || qView === 'figma-canvas') {
      setViewMode('figma-canvas');
    } else if (qView === 'real' || qView === 'real-site') {
      setViewMode('real-site');
    }
  }, [searchParams]);

  // Keep body data-theme and data-high-contrast attributes in sync
  useEffect(() => {
    document.body.setAttribute('data-theme', scheme);
  }, [scheme]);

  useEffect(() => {
    document.body.setAttribute('data-dark-mode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    document.body.setAttribute('data-high-contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
    }
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-reduced-motion', String(reducedMotion));
  }, [reducedMotion]);

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

  // Escape key closes settings, notifications, mobile menu, and logout modal
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setLogoutModalOpen(false);
      setSettingsOpen(false);
      setNotificationsOpen(false);
      setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const navigateToScreen = (screenId: ScreenId, openSosModal = false) => {
    setCurrentScreenId(screenId);
    setSettingsOpen(false);
    setNotificationsOpen(false);
    setMobileMenuOpen(false);
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
    <div
      className={`prototype-root ${viewMode === 'real-site' ? 'real-site-mode' : ''} ${
        showRubricTags ? 'show-rubric-tags' : ''
      }`}
      data-theme={scheme}
      data-high-contrast={String(highContrast)}
    >
      {/* WCAG 2.1 A11y Skip Link & Screen Reader Live Region */}
      <a href="#prototype-viewport" className="skip-to-content">
        Skip to main school portal content
      </a>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {srAnnouncement}
      </div>

      {/* TOP FIGMA / CASE TOOL BAR */}
      <header className="case-toolbar">
        <div className="case-brand">
          <span className="figma-badge">
            {viewMode === 'real-site' ? 'Live Hartwell Portal' : 'Figma Multi-Viewport Prototype'}
          </span>
          <div>
            <div className="case-title">
              Hartwell Primary School — Sustainable Travel System <span className="case-motto">• “Strive for the Highest”</span> (S1–S9 | 2-Member Equal Split: 4.5 Screens Each)
            </div>
            <div className="case-subtitle">
              Sofia Mironenko (S1–S4 + 0.5 S5) &amp; Kim Le (0.5 S5 + S6–S9) | Real Site + Figma Prototype
            </div>
          </div>
        </div>

        <div className="toolbar-controls">
          {/* Real Site vs Figma Prototype Mode Switcher */}
          <div className="btn-group" title="Toggle between Live Real Website and Figma Prototype Canvas">
            <button
              id="mode-real-site"
              type="button"
              className={`tb-btn ${viewMode === 'real-site' ? 'active' : ''}`}
              onClick={() => updateViewMode('real-site')}
            >
              🌿 Real Site Mode (Hartwell Theme)
            </button>
            <button
              id="mode-figma-canvas"
              type="button"
              className={`tb-btn ${viewMode === 'figma-canvas' ? 'active-mode' : ''}`}
              onClick={() => updateViewMode('figma-canvas')}
            >
              📐 Figma Canvas Mode
            </button>
          </div>

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

          <button
            type="button"
            className={`tb-btn ${showRubricTags ? 'active' : ''}`}
            style={{
              background: showRubricTags ? '#1B5E20' : '#0F172A',
              color: '#E2E8F0',
              border: '1px solid #475569',
              borderRadius: '6px',
            }}
            onClick={() => setShowRubricTags((prev) => !prev)}
            title="Show or hide assignment rubric codes (UC-01..09 / REQ tags) for marking"
          >
            {showRubricTags ? '🏷️ Rubric Codes: ON' : '🏷️ Rubric Codes: OFF'}
          </button>

          {/* Always-Accessible Top-Right Colour Scheme Switcher (Report §5.1 Step 3: <10s Swap) */}
          <div className="btn-group" title="Verify <10s Global Colour Token Swap (Scheme A vs Scheme B)">
            <button
              id="btn-scheme-a"
              type="button"
              className={`tb-btn ${scheme === 'scheme-a' ? 'active-navy' : ''}`}
              onClick={() => setScheme('scheme-a')}
            >
              Scheme A: Municipal Navy
            </button>
            <button
              id="btn-scheme-b"
              type="button"
              className={`tb-btn ${scheme === 'scheme-b' ? 'active' : ''}`}
              onClick={() => setScheme('scheme-b')}
            >
              Scheme B: Eco-Safe Green
            </button>
          </div>

          {/* Viewport Switcher: Auto / Mobile / Desktop / Whiteboard (shown in Figma Canvas mode) */}
          {viewMode === 'figma-canvas' && (
            <>
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

              <button
                type="button"
                className="tb-btn"
                style={{ background: '#334155', color: '#fff', borderRadius: '6px' }}
                onClick={() => setHistoryOpen((prev) => !prev)}
              >
                Version History (Sofia &amp; Kim)
              </button>
            </>
          )}
        </div>
      </header>

      <div className="workspace">
        {/* LEFT 9-SCREEN TRACEABILITY SIDEBAR (2-MEMBER 4.5 SCREEN SPLIT) */}
        <aside className="sidebar">
          <div className="sidebar-group-title">Sofia Mironenko (4.5 Screens)</div>
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

          <div className="sidebar-group-title member-b-hdr">Kim Le (4.5 Screens)</div>
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
              <span>08:46 AM &bull; Boroondara SafeNet &bull; {meta.url}</span>
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
                  <div>
                    <span className="school-title">
                      Hartwell Primary School — Sustainable Travel Portal
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginTop: 4,
                      }}
                    >
                      <span className="school-motto">“Strive for the Highest”</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>&bull;</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.78)',
                        }}
                      >
                        Signed in: {activeUser.name} ({activeUser.roleLabel})
                      </span>
                    </div>
                  </div>
                </div>

                {viewMode === 'real-site' && (
                  <div className="header-actions">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255, 255, 255, 0.12)',
                        border: '1px solid rgba(255, 255, 255, 0.28)',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        color: '#ffffff',
                      }}
                    >
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: '#2f7d4d',
                          color: '#ffffff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '10.5px',
                        }}
                      >
                        {activeUser.initials}
                      </span>
                      <span>
                        <strong>{activeUser.name}</strong> &bull; {activeUser.roleLabel}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="header-btn"
                      onClick={() => {
                        setLogoutConfirmed(false);
                        setLogoutModalOpen(true);
                      }}
                      title="End your secure session"
                    >
                      Sign Out
                    </button>

                    <span className="header-divider" aria-hidden="true"></span>

                    <button
                      type="button"
                      className={`header-btn ${darkMode ? 'active' : ''}`}
                      onClick={() => {
                        const next = !darkMode;
                        setDarkMode(next);
                        showToast(next ? '🌙 Dark Mode enabled' : '☀️ Light Mode enabled');
                      }}
                      title="Toggle dark mode / light mode theme"
                    >
                      {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>

                    <button
                      type="button"
                      className={`header-btn ${settingsOpen ? 'active' : ''}`}
                      aria-controls="settings-panel"
                      aria-expanded={settingsOpen}
                      onClick={() => {
                        setAccountDetailsOpen(false);
                        setNotificationsOpen(false);
                        setSettingsOpen((prev) => !prev);
                      }}
                    >
                      ⚙️ Settings &amp; A11y
                    </button>

                    {/* Live Commute Notification Bell Dropdown (Far Upper-Right of Header) */}
                    <div className="notif-bell-wrap">
                      <button
                        type="button"
                        className="notif-bell-btn"
                        title="View live commute and school alerts"
                        aria-label={`${unreadNotifs} unread notifications`}
                        aria-expanded={notificationsOpen}
                        onClick={() => {
                          setSettingsOpen(false);
                          setNotificationsOpen((prev) => !prev);
                        }}
                      >
                        🔔
                        {unreadNotifs > 0 && <span className="notif-badge">{unreadNotifs}</span>}
                      </button>
                      {notificationsOpen && (
                        <div className="notification-dropdown">
                          <div className="notif-header">
                            <span className="notif-header-title">Live Commute Alerts</span>
                            {unreadNotifs > 0 && (
                              <button
                                type="button"
                                className="notif-clear-btn"
                                onClick={() => {
                                  setUnreadNotifs(0);
                                  showToast('All alerts marked as read');
                                }}
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>
                          <div className="notif-list">
                            <div className="notif-item unread">
                              <span className="notif-icon">🟢</span>
                              <div>
                                <strong>Liam Mitchell</strong> checked in at Fordham Gardens 500m Hub (+50 pts).
                                <span className="notif-time">08:41 AM &bull; Gate Beacon Active</span>
                              </div>
                            </div>
                            <div className="notif-item unread">
                              <span className="notif-icon">🌤️</span>
                              <div>
                                <strong>BOM Weather Notice:</strong> Camberwell radar clear, 0% rain chance, winds mild 11 km/h S.
                                <span className="notif-time">08:35 AM &bull; Moorabbin Weather Radar</span>
                              </div>
                            </div>
                            <div className="notif-item unread">
                              <span className="notif-icon">🚦</span>
                              <div>
                                <strong>VicRoads Alert:</strong> 40 km/h school speed zones active &bull; crossing supervisor on duty at Toorak Rd.
                                <span className="notif-time">08:28 AM &bull; Boroondara Safe Routes</span>
                              </div>
                            </div>
                            <div className="notif-item">
                              <span className="notif-icon">🚌</span>
                              <div>
                                <strong>Walking Bus #2:</strong> Departed Toorak Rd hub with Supervisor John on schedule.
                                <span className="notif-time">08:18 AM &bull; Group G-04</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Mobile Hamburger Toggle for iPhone */}
                    <button
                      type="button"
                      className="header-btn mobile-hamburger-btn"
                      aria-label="Toggle mobile menu"
                      aria-expanded={mobileMenuOpen}
                      onClick={() => setMobileMenuOpen((o) => !o)}
                    >
                      <span className="hamburger-icon" aria-hidden="true">
                        {mobileMenuOpen ? '✕' : '☰'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
              <div className="screen-subtitle-bar"></div>
            </div>

            {/* Mobile Drawer Navigation for iPhone (Real-Site Mode) */}
            {viewMode === 'real-site' && mobileMenuOpen && (
              <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
                <nav
                  className="mobile-drawer-sheet"
                  aria-label="Mobile site navigation"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mobile-drawer-head">
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#53a36e', fontWeight: 800 }}>
                        Navigation &bull; {activeUser.roleLabel}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                        {activeUser.name}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="mobile-drawer-close"
                      aria-label="Close mobile menu"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mobile-drawer-links">
                    {ALL_SCREEN_IDS.filter((id) => {
                      if (showRubricTags) return true;
                      const role = activeUser.roleLabel.toLowerCase();
                      if (role.includes('parent')) return ['s7', 's4', 's8'].includes(id);
                      if (role.includes('teacher')) return ['s8', 's1', 's2', 's3', 's4', 's5'].includes(id);
                      return ['s6', 's2', 's3', 's4', 's5', 's8', 's9'].includes(id);
                    }).map((id) => {
                      const active = currentScreenId === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          className={`mobile-nav-link ${active ? 'active' : ''}`}
                          onClick={() => {
                            navigateToScreen(id);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <span>{REAL_SITE_TITLES[id]}</span>
                          <span style={{ fontSize: '11px', opacity: 0.7 }}>{SCREEN_META[id]?.reqBadge} &rsaquo;</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mobile-drawer-footer">
                    <button
                      type="button"
                      className="header-btn"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setSettingsOpen(true);
                      }}
                    >
                      ⚙️ Settings &amp; A11y
                    </button>
                    <button
                      type="button"
                      className="header-btn"
                      style={{ width: '100%', justifyContent: 'center', marginTop: '8px', color: '#f87171' }}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLogoutConfirmed(false);
                        setLogoutModalOpen(true);
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                </nav>
              </div>
            )}

            {/* Real-Site Live BOM Weather & VicRoads Status Strip */}
            {viewMode === 'real-site' && (
              <div
                className={`commute-status-strip ${
                  currentScreenId === 's4' || currentScreenId === 's5' ? 'hazard-active' : ''
                }`}
              >
                {currentScreenId === 's4' || currentScreenId === 's5' ? (
                  <>
                    <div className="status-strip-item">
                      <span className="strip-badge bom-badge-alert">BOM LIVE SQUALL</span>
                      <span style={{ color: '#fed7aa', fontWeight: 700 }}>
                        ⛈️ 16.0°C Camberwell &bull; Rain 80% Squall Warning &bull; Wind 38 km/h Gusts
                      </span>
                    </div>
                    <div className="status-strip-item">
                      <span className="strip-badge vicroads-badge-alert">VICROADS HAZARD</span>
                      <span style={{ color: '#fca5a5', fontWeight: 700 }}>
                        ⚠️ Toorak Rd Crossing BLOCKED (Flooding) &bull; CR-01 Myrtle Park Detour Active
                      </span>
                    </div>
                    <div className="status-strip-item">
                      <span className="live-dot alert" aria-hidden="true"></span>
                      <span>Automated Detour Routing Active &bull; SLA 0.38s Sync</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="status-strip-item">
                      <span className="strip-badge bom-badge">BOM Live</span>
                      <span>🌤️ 16.4°C Camberwell &bull; Rain 0% &bull; Wind 11 km/h S</span>
                    </div>
                    <div className="status-strip-item">
                      <span className="strip-badge vicroads-badge">VicRoads</span>
                      <span>🚦 40 km/h School Zones Active &bull; Toorak Rd Clear</span>
                    </div>
                    <div className="status-strip-item">
                      <span className="live-dot" aria-hidden="true"></span>
                      <span>Supervision Window: 08:00–09:15 AM &bull; SLA 0.38s Sync</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Real-Site Horizontal Portal Subnav + Editorial Hero Header */}
            {viewMode === 'real-site' && (
              <>
                <nav className="real-site-subnav" aria-label="Portal sections">
                  {ALL_SCREEN_IDS.filter((id) => {
                    // If user enabled rubric tags or is in figma mode, allow all screens
                    if (showRubricTags) return true;
                    // Filter by role: parent gets S7, S4, S8; teacher gets S8, S1-S5; admin gets S6, S2-S6, S8, S9
                    const role = activeUser.roleLabel.toLowerCase();
                    if (role.includes('parent')) {
                      return ['s7', 's4', 's8'].includes(id);
                    }
                    if (role.includes('teacher')) {
                      return ['s8', 's1', 's2', 's3', 's4', 's5'].includes(id);
                    }
                    // Admin/Operations
                    return ['s6', 's2', 's3', 's4', 's5', 's8', 's9'].includes(id);
                  }).map((id) => {
                    const active = currentScreenId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        className={`subnav-tab ${active ? 'active' : ''}`}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => {
                          navigateToScreen(id);
                          setSrAnnouncement(`Navigated to ${REAL_SITE_TITLES[id]}`);
                        }}
                      >
                        {REAL_SITE_TITLES[id]}
                      </button>
                    );
                  })}
                </nav>

                <div className="real-site-hero-bar">
                  <div>
                    <div className="real-site-kicker">
                      <span>Boroondara Safe Routes &bull; {meta.personaLabel}</span>
                    </div>
                    <h1 className="real-site-heading">{REAL_SITE_TITLES[currentScreenId]}</h1>
                  </div>
                  {showRubricTags && (
                    <Chip
                      label={`${meta.code} • ${meta.owner}`}
                      size="small"
                      sx={{
                        bgcolor: '#e9f4ec',
                        color: '#123e2b',
                        fontWeight: 800,
                        fontSize: 11.5,
                        px: 1,
                        border: '1px solid #b9d8c1',
                      }}
                    />
                  )}
                </div>
              </>
            )}

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
                        <div className="metric-val">{noahCheckedIn ? '1,960' : '1,840'}</div>
                        <div className="metric-lbl">Group Steps</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-val">1.35 km</div>
                        <div className="metric-lbl">Distance</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-val" style={{ color: noahCheckedIn ? '#15803d' : '#b45309' }}>
                          {noahCheckedIn ? '15 / 15' : '14 / 15'}
                        </div>
                        <div className="metric-lbl">Checked In</div>
                      </div>
                    </div>

                    {/* Roster Filter Pills */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                        marginBottom: '8px',
                        padding: '4px 6px',
                        background: 'var(--bg-card-subtle, rgba(0,0,0,0.03))',
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                        Filter Roster:
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          className={`seg-btn ${rosterFilter === 'all' ? 'active' : ''}`}
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => setRosterFilter('all')}
                        >
                          All (15)
                        </button>
                        <button
                          type="button"
                          className={`seg-btn ${rosterFilter === 'pending' ? 'active' : ''}`}
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => setRosterFilter('pending')}
                        >
                          Pending ({noahCheckedIn ? '0' : '1'})
                        </button>
                        <button
                          type="button"
                          className={`seg-btn ${rosterFilter === 'checked' ? 'active' : ''}`}
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => setRosterFilter('checked')}
                        >
                          Checked In ({noahCheckedIn ? '15' : '14'})
                        </button>
                      </div>
                    </div>

                    {/* Student Rows with Interactive Actions */}
                    {(rosterFilter === 'all' || rosterFilter === 'checked') && (
                      <div className="roster-row">
                        <span>1. Leo Mitchell (STU-1042, Yr 4B) — Bag Tag QR</span>
                        <span className="status-pill-ok">08:22 AM Checked In</span>
                      </div>
                    )}

                    {(rosterFilter === 'all' || rosterFilter === 'checked') && (
                      <div className="roster-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span>2. Maya Chen (STU-1088, Yr 4B)</span>
                          {earlyHandoffMaya && (
                            <div style={{ fontSize: '10.5px', color: '#15803d', fontWeight: 700, marginTop: '2px' }}>
                              ✓ Early Hand-Off: Collected by Guardian (08:35 AM)
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span className={earlyHandoffMaya ? 'status-pill-ok' : 'status-pill-ok'}>
                            {earlyHandoffMaya ? 'Handed Off' : '08:23 AM Checked In'}
                          </span>
                          <button
                            type="button"
                            className="btn-link-action"
                            style={{
                              fontSize: '10.5px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid var(--border-color)',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                            }}
                            title="Log mid-route early parent hand-off (Domain Model Exception Flow)"
                            onClick={() => {
                              const next = !earlyHandoffMaya;
                              setEarlyHandoffMaya(next);
                              showToast(next ? 'Logged early guardian hand-off for Maya Chen' : 'Reverted to active walking bus');
                            }}
                          >
                            {earlyHandoffMaya ? '↩ Undo Hand-Off' : 'Early Hand-Off'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Collapsed 12 Students Visual Indicator */}
                    {rosterFilter === 'all' && (
                      <div
                        style={{
                          padding: '6px 12px',
                          margin: '4px 0',
                          background: 'rgba(0,0,0,0.03)',
                          border: '1px dashed var(--border-color)',
                          borderRadius: '6px',
                          textAlign: 'center',
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                        }}
                      >
                        ••• 12 other students checked in en route (Students #3 through #14 verified) •••
                      </div>
                    )}

                    {(rosterFilter === 'all' || (rosterFilter === 'pending' && !noahCheckedIn) || (rosterFilter === 'checked' && noahCheckedIn)) && (
                      <div className="roster-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span>15. Noah Patel (STU-1104, Yr 3A)</span>
                          <div style={{ fontSize: '10.5px', color: noahCheckedIn ? '#15803d' : '#b45309' }}>
                            {noahCheckedIn ? '✓ Arrived at Hub Gate (Manual Scan)' : 'Unaccounted at 500m Hub'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span className={noahCheckedIn ? 'status-pill-ok' : 'status-pill-warn'}>
                            {noahCheckedIn ? '09:01 AM Checked In' : 'Pending @ 08:59 AM'}
                          </span>
                          {!noahCheckedIn ? (
                            <button
                              type="button"
                              className="btn-primary"
                              style={{ padding: '3px 8px', fontSize: '11px', minWidth: 'auto' }}
                              onClick={() => {
                                setNoahCheckedIn(true);
                                showToast('Noah Patel manually checked in via Bag Tag QR Scan');
                              }}
                              title="Scan QR bag tag or manually check in Noah Patel live"
                            >
                              📷 Scan QR / Check-In
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-link-action"
                              style={{
                                fontSize: '10.5px',
                                padding: '2px 6px',
                                border: '1px solid var(--border-color)',
                                background: 'transparent',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                              }}
                              onClick={() => {
                                setNoahCheckedIn(false);
                                showToast('Noah Patel reverted to Pending status');
                              }}
                            >
                              ↩ Reset
                            </button>
                          )}
                        </div>
                      </div>
                    )}
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
                        marginBottom: '8px',
                      }}
                    >
                      <span className="academic-annotation">
                        Peer Review Fix (Kim Le &rarr; Sofia M.):{' '}
                      </span>
                      High-priority emergency escalation requiring two-step confirmation before SMS broadcast.
                    </p>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#15803d',
                        background: 'rgba(22, 163, 74, 0.08)',
                        border: '1px solid rgba(22, 163, 74, 0.25)',
                        borderRadius: '6px',
                        padding: '5px 8px',
                        marginBottom: '10px',
                      }}
                    >
                      ⏱️ 3-Min Grace Check Verified (08:57–09:00 AM) &bull; Offline Local Cache Synced
                    </div>

                    {/* Pre-Checked Emergency Escalation Delivery Channels */}
                    <div
                      style={{
                        padding: '10px',
                        margin: '10px 0 14px',
                        background: 'rgba(185, 28, 28, 0.06)',
                        border: '1px solid rgba(185, 28, 28, 0.25)',
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#b91c1c', marginBottom: '6px' }}>
                        Automated Emergency Channels:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={sosChannels.sms}
                            onChange={(e) => setSosChannels((c) => ({ ...c, sms: e.target.checked }))}
                            style={{ accentColor: '#b91c1c' }}
                          />
                          <span><strong>Parent SMS Broadcast:</strong> Immediate SMS to all enrolled guardians</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={sosChannels.email}
                            onChange={(e) => setSosChannels((c) => ({ ...c, email: e.target.checked }))}
                            style={{ accentColor: '#b91c1c' }}
                          />
                          <span><strong>School Admin &amp; Principal:</strong> High-priority inbox dispatch</span>
                        </label>
                      </div>
                    </div>

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
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ marginTop: '12px', width: '100%', background: '#0a2b1d' }}
                      onClick={() => {
                        showToast(`Generated & Exported Walk Summary Report (${exportFormat.toUpperCase()})`);
                      }}
                    >
                      📥 Generate &amp; Export Report ({exportFormat.toUpperCase()})
                    </button>
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
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#b45309',
                          fontWeight: 600,
                          marginTop: '6px',
                        }}
                      >
                        ⚡ Auto-triggered by BOM/VicRoads threshold (Precip &gt; 75% &amp; Flooding) &bull; Click to override
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
                      className="academic-annotation"
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
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={mobilitySupportVerified}
                          onChange={(e) => setMobilitySupportVerified(e.target.checked)}
                          style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                        />
                        <span className="toggle-pill" style={{ background: mobilitySupportVerified ? 'var(--primary)' : '#64748b' }}>
                          {mobilitySupportVerified ? '✓ Verified 1:1' : 'Unverified'}
                        </span>
                      </label>
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
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          role="switch"
                          checked={autoPushDetour}
                          onChange={(e) => setAutoPushDetour(e.target.checked)}
                          style={{ width: '16px', height: '16px', accentColor: '#15803d' }}
                        />
                        <span className="toggle-pill" style={{ background: autoPushDetour ? '#15803d' : '#64748b' }}>
                          {autoPushDetour ? 'ON — AUTO PUSH' : 'MANUAL'}
                        </span>
                      </label>
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
                      className="academic-annotation"
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        marginBottom: '12px',
                      }}
                    >
                      Co-integrated by Sofia M. (S4 Hazard Trigger &amp; Constrained Dropdown Fix)
                      and Kim Le (S7 Parent Broadcast Link).
                    </p>
                    <div className="map-view-header">
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}>
                        Detour Corridor Preview &bull; Safe Checkpoints
                      </span>
                      <div className="map-toggle-group" role="group" aria-label="Select detour map view">
                        <button
                          type="button"
                          className={`map-toggle-btn ${mapViewMode === 'corridor' ? 'active' : ''}`}
                          onClick={() => setMapViewMode('corridor')}
                        >
                          🗺️ Safe Corridor
                        </button>
                        <button
                          type="button"
                          className={`map-toggle-btn ${mapViewMode === 'google-maps' ? 'active' : ''}`}
                          onClick={() => {
                            setMapViewMode('google-maps');
                            showToast('Loaded Google Maps detour preview for Myrtle Park');
                          }}
                        >
                          📍 Google Maps API
                        </button>
                      </div>
                    </div>
                    {mapViewMode === 'google-maps' ? (
                      <div className="google-maps-frame" style={{ marginBottom: '12px' }}>
                        <span className="maps-layer-badge">
                          🟢 Route B: Myrtle Park Greenway Detour
                        </span>
                        <iframe
                          title="Google Maps — Myrtle Park Greenway Safe Detour"
                          width="100%"
                          height="200"
                          style={{ border: 0, display: 'block' }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src="https://maps.google.com/maps?q=Myrtle+Park,+Camberwell+VIC+3124&t=&z=16&ie=UTF8&iwloc=&output=embed"
                        />
                      </div>
                    ) : (
                      <div style={{ marginBottom: '12px' }}>
                        {/* Checkpoint Node Flow Progress */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            background: '#0a2b1d',
                            color: '#ffffff',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            gap: '6px',
                            marginBottom: '8px',
                          }}
                        >
                          <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ color: '#ef4444', fontSize: '13px' }}>⛔ Blocked</div>
                            <div style={{ fontSize: '10px', opacity: 0.85 }}>Toorak Rd Cross</div>
                          </div>
                          <span style={{ color: '#4ade80', fontSize: '14px' }}>&rarr;</span>
                          <div style={{ textAlign: 'center', flex: 1.2, background: 'rgba(74, 222, 128, 0.15)', padding: '4px', borderRadius: '4px' }}>
                            <div style={{ color: '#4ade80', fontSize: '13px' }}>🛡️ Myrtle Hub</div>
                            <div style={{ fontSize: '10px', opacity: 0.9 }}>Sheltered Path (+4m)</div>
                          </div>
                          <span style={{ color: '#4ade80', fontSize: '14px' }}>&rarr;</span>
                          <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ color: '#60a5fa', fontSize: '13px' }}>🏫 Gate 2</div>
                            <div style={{ fontSize: '10px', opacity: 0.85 }}>Hartwell School</div>
                          </div>
                        </div>

                        <div className="map-box" style={{ height: '100px' }}>
                          <div className="map-corridor-line"></div>
                          <span className="map-pin">
                            {selectedAlternateRoute.split('(')[0].trim()}
                          </span>
                          <div
                            style={{
                              background: 'rgba(255,255,255,0.94)',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#111827',
                              zIndex: 2,
                            }}
                          >
                            Sheltered footpath &bull; Crossing Supervisor on duty at Myrtle Park
                          </div>
                        </div>
                      </div>
                    )}
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
                    {/* Offline Connectivity Pill & Sync State */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        marginBottom: '10px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      <span style={{ color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="live-dot" style={{ width: '7px', height: '7px' }}></span>
                        4G Connected &bull; Offline Sync Queue Ready (0 pending)
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                        Local IndexedDB Cache Active
                      </span>
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

                    {/* Expandable Multi-Select Student Checklist (SRS Roll-Call Spec) */}
                    <div
                      style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        marginTop: '8px',
                        background: 'var(--bg-card-subtle, rgba(0,0,0,0.02))',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingBottom: '6px',
                          borderBottom: '1px solid var(--border-color)',
                          marginBottom: '6px',
                          fontSize: '11.5px',
                          fontWeight: 800,
                        }}
                      >
                        <span>Group G-02 Roster (12/12 Present)</span>
                        <button
                          type="button"
                          className="btn-link-action"
                          style={{
                            fontSize: '11px',
                            color: 'var(--primary)',
                            background: 'transparent',
                            border: 0,
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                          onClick={() => {
                            const allChecked = Object.values(s6CheckedStudents).every(Boolean);
                            setS6CheckedStudents({
                              leo: !allChecked,
                              maya: !allChecked,
                              lucas: !allChecked,
                            });
                          }}
                        >
                          {Object.values(s6CheckedStudents).every(Boolean) ? 'Deselect All' : 'Select All Present'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', cursor: 'pointer' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="checkbox"
                              checked={!!s6CheckedStudents['leo']}
                              onChange={(e) => setS6CheckedStudents((s) => ({ ...s, leo: e.target.checked }))}
                              style={{ accentColor: 'var(--primary)' }}
                            />
                            <strong>Leo Mitchell</strong> (STU-1042, Yr 4B)
                          </span>
                          <span className="status-pill-ok" style={{ fontSize: '10px', padding: '1px 6px' }}>08:44 AM Beacon</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', cursor: 'pointer' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="checkbox"
                              checked={!!s6CheckedStudents['maya']}
                              onChange={(e) => setS6CheckedStudents((s) => ({ ...s, maya: e.target.checked }))}
                              style={{ accentColor: 'var(--primary)' }}
                            />
                            <strong>Maya Chen</strong> (STU-1088, Yr 4B)
                          </span>
                          <span className="status-pill-ok" style={{ fontSize: '10px', padding: '1px 6px' }}>08:45 AM Beacon</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', cursor: 'pointer' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="checkbox"
                              checked={!!s6CheckedStudents['lucas']}
                              onChange={(e) => setS6CheckedStudents((s) => ({ ...s, lucas: e.target.checked }))}
                              style={{ accentColor: 'var(--primary)' }}
                            />
                            <strong>Lucas Nguyen</strong> (STU-1095, Yr 4B)
                          </span>
                          <span className="status-pill-ok" style={{ fontSize: '10px', padding: '1px 6px' }}>08:46 AM Beacon</span>
                        </label>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '4px' }}>
                          +9 additional students verified by Gate 2 RFID scanner
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">
                        School Gate Congestion &amp; Governance KPIs
                      </span>
                      <span className="req-pill">Victoria Walks Target</span>
                    </div>

                    {/* Project Budget Governance Metric */}
                    <div
                      style={{
                        padding: '8px 10px',
                        background: 'rgba(30, 58, 138, 0.06)',
                        border: '1px solid rgba(30, 58, 138, 0.2)',
                        borderRadius: '6px',
                        marginBottom: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800 }}>
                        <span style={{ color: '#1e3a8a' }}>Active Travel Grant Budget ($45,000 Allocation)</span>
                        <span style={{ color: '#15803d' }}>$38,250 Spent (85%)</span>
                      </div>
                      <div className="progress-track" style={{ height: '6px', marginTop: '4px' }}>
                        <div className="progress-fill" style={{ width: '85%', background: '#1e3a8a' }}></div>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Beacon hardware: $18.4k &bull; Signage &amp; markings: $14.2k &bull; Remaining contingency: $6,750
                      </div>
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
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ marginTop: '14px', width: '100%', background: '#0a2b1d' }}
                      onClick={downloadCouncilAuditCsv}
                    >
                      📥 Download Boroondara Council Travel Audit (CSV)
                    </button>
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
                    <div className="sibling-pills" role="radiogroup" aria-label="Select student sibling">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selectedChild.startsWith('Leo')}
                        className={`sibling-pill-btn ${selectedChild.startsWith('Leo') ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedChild('Leo Mitchell (Year 4B) — Active on Route B Detour');
                          showToast('Viewing live transit for Leo Mitchell (Year 4B)');
                        }}
                      >
                        🎒 Leo Mitchell (Yr 4B)
                      </button>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selectedChild.startsWith('Sophie')}
                        className={`sibling-pill-btn ${selectedChild.startsWith('Sophie') ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedChild('Sophie Mitchell (Year 1A) — Arrived Gate 2 (08:44 AM)');
                          showToast('Viewing arrival record for Sophie Mitchell (Yr 1A)');
                        }}
                      >
                        👧 Sophie Mitchell (Yr 1A)
                      </button>
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

                    <div className="map-view-header">
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}>
                        Live Safe Route Transit Map
                      </span>
                      <div className="map-toggle-group" role="group" aria-label="Select map view">
                        <button
                          type="button"
                          className={`map-toggle-btn ${mapViewMode === 'corridor' ? 'active' : ''}`}
                          onClick={() => setMapViewMode('corridor')}
                        >
                          🗺️ Safe Corridor
                        </button>
                        <button
                          type="button"
                          className={`map-toggle-btn ${mapViewMode === 'google-maps' ? 'active' : ''}`}
                          onClick={() => {
                            setMapViewMode('google-maps');
                            showToast('Loaded interactive Google Maps for Hartwell PS');
                          }}
                        >
                          📍 Google Maps API
                        </button>
                      </div>
                    </div>

                    {mapViewMode === 'google-maps' ? (
                      <div className="google-maps-frame">
                        <span className="maps-layer-badge">
                          🟢 VicRoads &amp; Council Safe Route Layer Active
                        </span>
                        <iframe
                          title="Google Maps — Hartwell Primary School Safe Travel Corridors"
                          width="100%"
                          height="280"
                          style={{ border: 0, display: 'block' }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src="https://maps.google.com/maps?q=Hartwell+Primary+School,+Milverton+Street,+Camberwell+VIC+3124&t=&z=16&ie=UTF8&iwloc=&output=embed"
                        />
                      </div>
                    ) : (
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
                    )}
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
                {/* Mode Banner: Projected Classroom Smartboard for Teachers vs Family Homeroom Summary for Parents */}
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
                      {activeUser.roleLabel.toLowerCase().includes('parent')
                        ? '🎒 Family View &bull; Homeroom Sustainability & Privacy Consent'
                        : '💻 Classroom Interactive Whiteboard Mode (Projected by Teacher in Homeroom)'}
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
                        {activeUser.roleLabel.toLowerCase().includes('parent')
                          ? 'Class Active Travel Podium (Leo & Sophie\'s Homerooms)'
                          : 'Homeroom Active Travel Podium (Classroom Smartboard)'}
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
                      <span className="card-title">
                        {activeUser.roleLabel.toLowerCase().includes('parent')
                          ? 'Parental GPS Telemetry Consent & Privacy'
                          : 'Time-Bounded Location Privacy Manager'}
                      </span>
                      <span className="req-pill">UC-08 | REQ-ETH-01 (APP 1/6)</span>
                    </div>

                    {activeUser.roleLabel.toLowerCase().includes('parent') && (
                      <div
                        style={{
                          padding: '8px 10px',
                          background: 'rgba(34, 197, 94, 0.08)',
                          border: '1px solid rgba(34, 197, 94, 0.25)',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          color: '#15803d',
                          fontWeight: 700,
                          marginBottom: '10px',
                        }}
                      >
                        🔒 Guardian Consent Active: Your child&apos;s GPS is only gathered inside the strict morning walk window and purged automatically.
                      </div>
                    )}

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

                    {activeUser.roleLabel.toLowerCase().includes('parent') ? (
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ marginTop: '8px' }}
                        onClick={() => navigateToScreen('s7')}
                      >
                        &larr; Return to Live Family Geofence (S7)
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ marginTop: '8px' }}
                        onClick={() => navigateToScreen('s9')}
                      >
                        Open Council Export &amp; WCAG Settings (S9) &rarr;
                      </button>
                    )}
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

                    {/* Date Range Selector for Boroondara Council Export */}
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label">
                        <span>Export Term Date Range</span>
                        <span className="control-type-hint">[Calendar Date Range Selector]</span>
                      </label>
                      <input
                        type="text"
                        className="input-box"
                        value={s9DateRange}
                        onChange={(e) => setS9DateRange(e.target.value)}
                        placeholder="e.g. Term 4: 01/10/2026 – 02/11/2026"
                      />
                    </div>

                    <div className="toggle-row">
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700 }}>
                          Mandatory PII Anonymization (Strip Names/IDs)
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          <span className="academic-annotation">
                            Peer Review Fix (Sofia M. &rarr; Kim Le):{' '}
                          </span>
                          Locked ON to comply with Australian Privacy Principle (APP 6) data minimisation.
                        </div>
                      </div>
                      <span className="toggle-pill locked">🔒 [LOCKED ON — APP 6]</span>
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
                      {/* Typography Scale Visual Proof */}
                      <div
                        style={{
                          fontSize: fontScale === '150' ? '15px' : fontScale === '125' ? '13.5px' : '11.5px',
                          color: 'var(--primary)',
                          background: 'var(--bg-card-subtle, rgba(0,0,0,0.03))',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          marginTop: '6px',
                          fontWeight: 600,
                          transition: 'font-size 0.2s ease',
                        }}
                      >
                        Sample Scaled Text: Active Hub Drop-Off Notice ({fontScale}% zoom)
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span>Multi-Channel Alert Equity (No-Smartphone Parity)</span>
                        <span className="control-type-hint">[Styled Checkboxes]</span>
                      </label>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={channels.push}
                            onChange={(e) => setChannels((prev) => ({ ...prev, push: e.target.checked }))}
                            style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                          />
                          <span>App Push Notification (Smartphone)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={channels.sms}
                            onChange={(e) => setChannels((prev) => ({ ...prev, sms: e.target.checked }))}
                            style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                          />
                          <span>Two-Way SMS Broadcast (Guaranteed Feature Phone Parity)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={channels.email}
                            onChange={(e) => setChannels((prev) => ({ ...prev, email: e.target.checked }))}
                            style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                          />
                          <span>Daily Summary Email Digest</span>
                        </label>
                      </div>
                    </div>

                    {/* Live SMS Fallback Preview Mockup Box (Iteration 2 Rubric) */}
                    <div
                      style={{
                        padding: '10px 12px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        marginTop: '8px',
                      }}
                    >
                      <div style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>
                        📱 Live SMS Fallback Dispatch Preview:
                      </div>
                      <div
                        style={{
                          background: '#e2e8f0',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          color: '#0f172a',
                          lineHeight: '1.4',
                        }}
                      >
                        [HARTWELL PS] Leo arrived safely at Gate 2 (08:46 AM). Route B Detour verified. Non-smartphone safe check-in complete. Reply STOP to opt out.
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-primary"
                      style={{ marginTop: '14px', width: '100%', background: '#0a2b1d' }}
                      onClick={downloadCouncilAuditCsv}
                    >
                      📥 Export Anonymised Boroondara Council Audit (CSV)
                    </button>
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
                    Added following Kim Le&apos;s Peer Usability Test on Sofia M.&apos;s screen
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
                aria-describedby="settings-desc"
              >
                <p id="settings-desc" className="sr-only">
                  Configure accessibility preferences, high contrast, text enlargement, reduced motion, notification channels, and active profile.
                </p>
                <div
                  id="settings-main"
                  style={{ display: accountDetailsOpen ? 'none' : undefined }}
                >
                  <div className="settings-header">
                    <div>
                      <div className="settings-kicker">Preferences &amp; Accessibility</div>
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

                  <div className="account-summary" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                      <div className="account-avatar" aria-hidden="true">
                        {activeUser.initials}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="account-summary-name">{activeUser.name}</div>
                        <div className="account-summary-role">{activeUser.roleLabel} &bull; {activeUser.email}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '6px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Quick Switch Persona:
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {(['parent', 'teacher', 'admin'] as const).map((roleKey) => {
                          const acc = DEMO_ACCOUNTS[roleKey];
                          const isCurrent = activeUser.email === acc.email;
                          return (
                            <button
                              key={roleKey}
                              type="button"
                              onClick={() => {
                                switchDemoPersona(acc);
                                setSrAnnouncement(`Switched demo persona to ${acc.name}, ${acc.roleLabel}`);
                              }}
                              style={{
                                padding: '4px 10px',
                                fontSize: '11px',
                                fontWeight: 700,
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                background: isCurrent ? 'var(--primary)' : 'var(--bg-card)',
                                color: isCurrent ? '#ffffff' : 'var(--text-main)',
                                cursor: 'pointer',
                              }}
                              aria-pressed={isCurrent}
                            >
                              {acc.name} ({roleKey === 'parent' ? 'Parent' : roleKey === 'teacher' ? 'Teacher' : 'Admin'})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="settings-list">
                    <div className="settings-row">
                      <div className="settings-row-copy">
                        <strong>Dark mode</strong>
                        <span>Comfortable low-glare viewing for early mornings and night</span>
                      </div>
                      <button
                        className="settings-switch"
                        id="darkmode-toggle"
                        type="button"
                        role="switch"
                        aria-label="Dark mode"
                        aria-checked={darkMode}
                        onClick={() => {
                          const next = !darkMode;
                          setDarkMode(next);
                          setSrAnnouncement(next ? 'Dark mode enabled' : 'Dark mode disabled');
                        }}
                      ></button>
                    </div>
                    <div className="settings-row">
                      <div className="settings-row-copy">
                        <strong>Colour palette (CASE Tool Scheme)</strong>
                        <span>{scheme === 'scheme-b' ? 'Scheme B: Eco-Green (AAA Compliant)' : 'Scheme A: Navy (Municipal)'}</span>
                      </div>
                      <button
                        type="button"
                        className="subnav-tab"
                        style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 700 }}
                        onClick={() => {
                          const next = scheme === 'scheme-b' ? 'scheme-a' : 'scheme-b';
                          setScheme(next);
                          setSrAnnouncement(`Swapped to ${next === 'scheme-b' ? 'Scheme B Eco-Green' : 'Scheme A Navy'}`);
                        }}
                      >
                        Swap to {scheme === 'scheme-b' ? 'Scheme A' : 'Scheme B'}
                      </button>
                    </div>
                    <div className="settings-row">
                      <div className="settings-row-copy">
                        <strong>High contrast</strong>
                        <span>Increase colour, focus ring, and border contrast</span>
                      </div>
                      <button
                        className="settings-switch"
                        id="contrast-toggle"
                        type="button"
                        role="switch"
                        aria-label="High contrast mode"
                        aria-checked={highContrast}
                        onClick={() => {
                          const next = !highContrast;
                          setHighContrast(next);
                          setSrAnnouncement(next ? 'High contrast mode enabled' : 'High contrast mode disabled');
                        }}
                      ></button>
                    </div>
                    <div className="settings-row">
                      <div className="settings-row-copy">
                        <strong>Bigger text</strong>
                        <span>Enlarge text across the school portal</span>
                      </div>
                      <button
                        className="settings-switch"
                        id="text-size-toggle"
                        type="button"
                        role="switch"
                        aria-label="Bigger text scaling"
                        aria-checked={largeText}
                        onClick={() => {
                          const next = !largeText;
                          setLargeText(next);
                          setSrAnnouncement(next ? 'Bigger text scaling enabled' : 'Bigger text scaling disabled');
                        }}
                      ></button>
                    </div>
                    <div className="settings-row">
                      <div className="settings-row-copy">
                        <strong>Reduce motion</strong>
                        <span>Disable animations and pulsing commute badge</span>
                      </div>
                      <button
                        className="settings-switch"
                        id="motion-toggle"
                        type="button"
                        role="switch"
                        aria-label="Reduce motion"
                        aria-checked={reducedMotion}
                        onClick={() => {
                          const next = !reducedMotion;
                          setReducedMotion(next);
                          setSrAnnouncement(next ? 'Reduced motion enabled' : 'Reduced motion disabled');
                        }}
                      ></button>
                    </div>
                    <div className="settings-row">
                      <div className="settings-row-copy">
                        <strong>Rubric &amp; assignment codes</strong>
                        <span>Show UC-01..09 and REQ tags for marking</span>
                      </div>
                      <button
                        className="settings-switch"
                        id="rubric-toggle"
                        type="button"
                        role="switch"
                        aria-label="Rubric and assignment requirement tags"
                        aria-checked={showRubricTags}
                        onClick={() => {
                          const next = !showRubricTags;
                          setShowRubricTags(next);
                          setSrAnnouncement(next ? 'Assignment requirement tags visible' : 'Assignment requirement tags hidden');
                        }}
                      ></button>
                    </div>

                    <div className="settings-section-divider">
                      <span>Travel Alerts &amp; Notification Channels</span>
                    </div>

                    <div className="settings-row">
                      <div className="settings-row-copy">
                        <strong>Push notifications</strong>
                        <span>Real-time bus arrival &amp; geo-hub alerts</span>
                      </div>
                      <button
                        className="settings-switch"
                        id="push-toggle"
                        type="button"
                        role="switch"
                        aria-label="Push notifications"
                        aria-checked={channels.push}
                        onClick={() => setChannels(c => ({ ...c, push: !c.push }))}
                      ></button>
                    </div>
                    <div className="settings-row">
                      <div className="settings-row-copy">
                        <strong>SMS notifications</strong>
                        <span>Emergency weather reroute &amp; dispatch SMS</span>
                      </div>
                      <button
                        className="settings-switch"
                        id="sms-toggle"
                        type="button"
                        role="switch"
                        aria-label="SMS notifications"
                        aria-checked={channels.sms}
                        onClick={() => setChannels(c => ({ ...c, sms: !c.sms }))}
                      ></button>
                    </div>

                    <button
                      className="settings-row"
                      type="button"
                      aria-haspopup="dialog"
                      onClick={() => setAccountDetailsOpen(true)}
                    >
                      <span className="settings-row-copy">
                        <strong>Account profile</strong>
                        <span>View your verified role and access permissions</span>
                      </span>
                      <span className="settings-chevron" aria-hidden="true">
                        &rsaquo;
                      </span>
                    </button>
                    <button
                      className="settings-row settings-logout"
                      type="button"
                      aria-haspopup="dialog"
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
            <nav className="bottom-nav" aria-label="Mobile and quick navigation">
              <Link
                href="/s1"
                className={`tab-btn ${
                  !settingsOpen && ['s1', 's2', 's3'].includes(currentScreenId) ? 'active' : ''
                }`}
                aria-current={!settingsOpen && ['s1', 's2', 's3'].includes(currentScreenId) ? 'page' : undefined}
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
                aria-current={!settingsOpen && currentScreenId === 's4' ? 'page' : undefined}
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
                aria-current={!settingsOpen && currentScreenId === 's5' ? 'page' : undefined}
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
                aria-current={!settingsOpen && ['s6', 's7'].includes(currentScreenId) ? 'page' : undefined}
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
                aria-current={!settingsOpen && ['s8', 's9'].includes(currentScreenId) ? 'page' : undefined}
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
                aria-label="Settings and accessibility preferences"
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

            {/* Genuine Primary School Portal Footer in Real-Site Mode */}
            {viewMode === 'real-site' && (
              <footer className="real-site-footer">
                <div className="real-site-footer-inner">
                  <div>
                    <h4>Hartwell Primary School — Sustainable Travel Portal</h4>
                    <p style={{ fontStyle: 'italic', color: '#86efac', fontSize: 13, margin: '2px 0 8px', fontWeight: 600 }}>
                      Motto: “Strive for the Highest” &bull; Established 1922
                    </p>
                    <p>
                      Supporting active, safe, and sustainable walking school buses and active travel
                      for students and families across Camberwell and Boroondara.
                    </p>
                    <p style={{ marginTop: 8 }}>
                      <strong>School Campus:</strong> Milverton Street, Camberwell VIC 3124 &bull;{' '}
                      <strong>Phone:</strong> (03) 9889 4012 &bull;{' '}
                      <strong>Email:</strong>{' '}
                      <a href="mailto:office@hartwellps.vic.edu.au">office@hartwellps.vic.edu.au</a>
                    </p>
                  </div>
                  <div>
                    <h4>Active Corridors &bull; Drop-Off Hub Locations</h4>
                    <p>
                      &bull;{' '}
                      <a
                        href="https://maps.google.com/?q=Toorak+Rd+and+Camberwell+Rd,+Camberwell+VIC+3124"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToScreen('s4');
                          showToast('Opening Corridor C-01: Toorak Rd / Camberwell Rd Google Maps location');
                        }}
                        title="View Toorak Rd Crossing on Google Maps"
                      >
                        📍 Toorak / Camberwell Rd Crossing
                      </a>
                      <br />
                      &bull;{' '}
                      <a
                        href="https://maps.google.com/?q=Myrtle+Park,+Camberwell+VIC+3124"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          setMapViewMode('google-maps');
                          navigateToScreen('s5');
                          showToast('Opening Hub H-02: Myrtle Park Greenway 500m Hub Google Maps location');
                        }}
                        title="View Myrtle Park 500m Hub on Google Maps"
                      >
                        📍 Myrtle Park Greenway (500m Hub)
                      </a>
                      <br />
                      &bull;{' '}
                      <a
                        href="https://maps.google.com/?q=Fordham+Gardens,+Camberwell+VIC+3124"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToScreen('s2');
                          showToast('Opening Hub H-01: Fordham Gardens 500m Drop-Off Hub Google Maps location');
                        }}
                        title="View Fordham Gardens 500m Hub on Google Maps"
                      >
                        📍 Fordham Gardens Hub (500m Hub)
                      </a>
                      <br />
                      &bull;{' '}
                      <a
                        href="https://maps.google.com/?q=Hartwell+Railway+Station,+Camberwell+VIC+3124"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          setMapViewMode('google-maps');
                          navigateToScreen('s7');
                          showToast('Opening Hub H-03: Hartwell Station Transit Hub Google Maps location');
                        }}
                        title="View Hartwell Station Hub on Google Maps"
                      >
                        📍 Hartwell Station Hub
                      </a>
                    </p>
                  </div>
                  <div>
                    <h4>Safety &amp; Compliance</h4>
                    <p>
                      &bull; Victorian Child Safe Standards<br />
                      &bull; Privacy Act &amp; APP 6 Minimisation<br />
                      &bull; Boroondara Safe Routes Partnership<br />
                      &bull; Emergency Ops: (03) 9889 4012
                    </p>
                  </div>
                </div>
                <div className="real-site-footer-bottom">
                  <span>&copy; 2026 Hartwell Primary School &bull; “Strive for the Highest” &bull; Department of Education Victoria.</span>
                  <span>System Status: 🟢 All Corridors Operating Normal &bull; SLA 0.38s Cloud Sync</span>
                </div>
              </footer>
            )}

            {/* Real-Site Interactive Action Toast Alert */}
            {toastMessage && (
              <div className="action-toast" role="status" aria-live="polite">
                <span className="toast-icon">✓</span>
                <span className="toast-text">{toastMessage}</span>
                <button
                  type="button"
                  className="toast-close"
                  onClick={() => setToastMessage(null)}
                  aria-label="Dismiss notification"
                >
                  &times;
                </button>
              </div>
            )}
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
              Sofia Mironenko (S1, S2, S3, S4 + 0.5 S5)
            </div>
            <div className="vh-desc">
              Implemented 2-step SOS confirmation modal on S3/S2 (after Kim Le&apos;s peer test)
              &amp; replaced free-text detour with constrained 500m Hub dropdown on S5.
            </div>
          </div>

          <div className="vh-item member-b">
            <div className="vh-version-tag">
              <span>v2.3 — Smartboard S8, S6–S9 &amp; CR-01</span>
              <span className="vh-time">06 Nov, 16:15</span>
            </div>
            <div className="vh-author">Kim Le (0.5 S5 + S6, S7, S8, S9)</div>
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
              500m Hub override and Kim Le&apos;s S7 Live Parent Map alert.
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
