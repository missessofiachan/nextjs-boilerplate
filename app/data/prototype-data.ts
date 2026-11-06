export type ScreenId = 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8' | 's9';

export type ViewportMode = 'auto' | 'mobile' | 'desktop';
export type ColorScheme = 'scheme-a' | 'scheme-b';

export interface ScreenMetadata {
  id: ScreenId;
  code: string;
  shortTitle: string;
  title: string;
  owner: string;
  memberGroup: 'A' | 'B';
  deviceTag: string;
  reqBadge: string;
  subText: string;
  defaultDesktop: boolean;
  personaLabel: string;
  url: string;
  routePath: string;
  semanticPath: string;
}

export const SCREEN_META: Record<ScreenId, ScreenMetadata> = {
  s1: {
    id: 's1',
    code: 'S1',
    shortTitle: 'S1: Unified OTP Login',
    title: 'S1: Unified Login & Dynamic OTP',
    owner: 'Owner: Sofia M. (Member A) | UC-01',
    memberGroup: 'A',
    deviceTag: 'Mobile/Web',
    reqBadge: 'UC-01',
    subText: 'Sofia M. | REQ-SEC-01 Segmented Role & OTP',
    defaultDesktop: false,
    personaLabel: 'Duty Assistant Roadside Mobile App / Staff SSO (440px Handheld)',
    url: 'https://portal.hartwellps.vic.edu.au/auth/login',
    routePath: '/s1',
    semanticPath: '/auth/login',
  },
  s2: {
    id: 's2',
    code: 'S2',
    shortTitle: 'S2: 500m Hub Check-In',
    title: 'S2: 500m Hub Check-In & Walk Tracker',
    owner: 'Owner: Sofia M. (Member A) | UC-02',
    memberGroup: 'A',
    deviceTag: 'Mobile App',
    reqBadge: 'UC-02',
    subText: 'Sofia M. | REQ-TRK-01 Date Picker & 14/15',
    defaultDesktop: false,
    personaLabel: 'Duty Assistant Roadside Mobile App (440px Outdoor Handheld)',
    url: 'https://portal.hartwellps.vic.edu.au/duty/hub-checkin',
    routePath: '/s2',
    semanticPath: '/duty/hub-checkin',
  },
  s3: {
    id: 's3',
    code: 'S3',
    shortTitle: 'S3: 9AM SOS & Walk Report',
    title: 'S3: 9:00 AM SOS Alert & Walk Summary',
    owner: 'Owner: Sofia M. (Member A) | UC-03',
    memberGroup: 'A',
    deviceTag: 'Mobile/PC',
    reqBadge: 'UC-03',
    subText: 'Sofia M. | REQ-SAF-02 2-Step SOS Modal',
    defaultDesktop: false,
    personaLabel: 'Duty Assistant Mobile App & Teacher PDF Export (440px / Web)',
    url: 'https://portal.hartwellps.vic.edu.au/duty/sos-escalation',
    routePath: '/s3',
    semanticPath: '/duty/sos-escalation',
  },
  s4: {
    id: 's4',
    code: 'S4',
    shortTitle: 'S4: BOM & VicRoads Feed',
    title: 'S4: Live BOM Weather & Traffic Feed',
    owner: 'Owner: Sofia M. (Member A) | UC-04',
    memberGroup: 'A',
    deviceTag: 'Mobile/Web',
    reqBadge: 'UC-04',
    subText: 'Sofia M. | REQ-ENV-01 Live Weather & Traffic',
    defaultDesktop: false,
    personaLabel: 'Duty Assistant Roadside Weather Monitor (440px Outdoor Handheld)',
    url: 'https://portal.hartwellps.vic.edu.au/hazard/bom-feed',
    routePath: '/s4',
    semanticPath: '/hazard/bom-feed',
  },
  s5: {
    id: 's5',
    code: 'S5',
    shortTitle: 'S5: CR-01 Route Override',
    title: 'S5: Alternate Route Selector (CR-01)',
    owner: 'Co-Owners: Sofia M. (0.5) & Member B (0.5) | UC-05',
    memberGroup: 'A',
    deviceTag: 'Shared 0.5/0.5',
    reqBadge: 'UC-05',
    subText: 'Sofia M. + Member B | REQ-ENV-02 CR-01 Detour',
    defaultDesktop: false,
    personaLabel: 'Duty Assistant & Admin CR-01 Detour Override (440px Handheld)',
    url: 'https://portal.hartwellps.vic.edu.au/hazard/cr01-override',
    routePath: '/s5',
    semanticPath: '/hazard/cr01-override',
  },
  s6: {
    id: 's6',
    code: 'S6',
    shortTitle: 'S6: Hub Roll Call & KPIs',
    title: 'S6: Hub Roll Call & Congestion KPIs',
    owner: 'Owner: Member B | UC-06',
    memberGroup: 'B',
    deviceTag: 'Admin PC',
    reqBadge: 'UC-06',
    subText: 'Member B | REQ-TRK-03 39%→51% Gate KPIs',
    defaultDesktop: true,
    personaLabel: 'School Admin & Teacher Computer Dashboard (Wide Desktop Browser)',
    url: 'https://portal.hartwellps.vic.edu.au/admin/rollcall-kpis',
    routePath: '/s6',
    semanticPath: '/admin/rollcall-kpis',
  },
  s7: {
    id: 's7',
    code: 'S7',
    shortTitle: 'S7: Parent Geofence Portal',
    title: 'S7: Parental Live Geofence Portal',
    owner: 'Owner: Member B | UC-07',
    memberGroup: 'B',
    deviceTag: 'Parent PC/App',
    reqBadge: 'UC-07',
    subText: 'Member B | REQ-PAR-01 08:46 AM Arrival',
    defaultDesktop: true,
    personaLabel: 'Parent Work Computer Web Portal & Mobile App (Responsive Desktop/App)',
    url: 'https://portal.hartwellps.vic.edu.au/parent/live-geofence',
    routePath: '/s7',
    semanticPath: '/parent/live-geofence',
  },
  s8: {
    id: 's8',
    code: 'S8',
    shortTitle: 'S8: Whiteboard Gamification',
    title: 'S8: Classroom Smartboard Leaderboard & Privacy',
    owner: 'Owner: Member B | UC-08',
    memberGroup: 'B',
    deviceTag: 'Smartboard',
    reqBadge: 'UC-08',
    subText: 'Member B | REQ-ETH-01 Golden Boot & APP 6',
    defaultDesktop: true,
    personaLabel: 'Teacher Classroom Smartboard / Interactive Whiteboard + Parent Privacy',
    url: 'https://portal.hartwellps.vic.edu.au/classroom/walking-wednesday-whiteboard',
    routePath: '/s8',
    semanticPath: '/classroom/walking-wednesday-whiteboard',
  },
  s9: {
    id: 's9',
    code: 'S9',
    shortTitle: 'S9: Council Export & Access',
    title: 'S9: Council Export & Accessibility',
    owner: 'Owner: Member B | UC-09',
    memberGroup: 'B',
    deviceTag: 'Admin PC',
    reqBadge: 'UC-09',
    subText: 'Member B | REQ-ACC-01 Locked PII & WCAG',
    defaultDesktop: true,
    personaLabel: 'School Admin Computer — Boroondara Council Export & WCAG Settings',
    url: 'https://portal.hartwellps.vic.edu.au/admin/council-export',
    routePath: '/s9',
    semanticPath: '/admin/council-export',
  },
};

export const ALL_SCREEN_IDS: ScreenId[] = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'];

export function isValidScreenId(val: string | null | undefined): val is ScreenId {
  if (!val) return false;
  return ALL_SCREEN_IDS.includes(val.toLowerCase() as ScreenId);
}
