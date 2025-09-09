// Design tokens based on the Frontend PRD
export const colors = {
  // Primary Background
  background: {
    primary: '#0a0a0a',
    secondary: '#1a1a1a',
    card: 'rgba(34, 34, 34, 0.8)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  
  // Accent Colors
  accent: {
    red: '#ff3333',
    blue: '#00d4ff',
    green: '#00ff88',
    purple: '#8b5cf6',
    gold: '#fbbf24',
  },
  
  // Text Colors
  text: {
    primary: '#ffffff',
    secondary: '#cccccc',
    muted: '#888888',
    disabled: '#555555',
  },
  
  // Game Brand Colors
  games: {
    fortnite: '#8b5cf6',
    league: '#c89b3c',
    valorant: '#ff4655',
    roblox: '#00a2ff',
    discord: '#5865f2',
    cod: '#ff6b35',
  },
  
  // Status Colors
  status: {
    success: '#00ff88',
    warning: '#ffb800',
    error: '#ff3333',
    info: '#00d4ff',
  },
  
  // Border Colors
  border: {
    primary: '#222222',
    secondary: '#333333',
    accent: '#444444',
  },
} as const;

export const typography = {
  fontFamily: {
    heading: ['Orbitron', 'Montserrat', 'sans-serif'],
    body: ['Inter', 'Roboto', 'sans-serif'],
    gaming: ['Orbitron', 'monospace'],
  },
  
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  lineHeight: {
    tight: '1.1',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
  '5xl': '128px',
} as const;

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  glow: '0 0 20px rgba(255, 51, 51, 0.3)',
  glowBlue: '0 0 20px rgba(0, 212, 255, 0.3)',
} as const;

export const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
