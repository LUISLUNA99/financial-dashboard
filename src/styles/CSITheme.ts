// CSI Corporate Colors Theme
// Grupo CSI - Empresa madre de BUZZWORD e INOVITZ

export const CSIColors = {
  // Primary CSI Brand Colors
  primary: {
    main: '#1B365C', // Azul corporativo CSI
    light: '#2B4F7D',
    dark: '#0F1E33',
    contrast: '#FFFFFF'
  },

  // Secondary Colors
  secondary: {
    main: '#C8102E', // Rojo corporativo CSI
    light: '#E8415A',
    dark: '#8B0000',
    contrast: '#FFFFFF'
  },

  // Accent Colors
  accent: {
    gold: '#D4AF37', // Oro corporativo
    silver: '#C0C0C0', // Plata
    bronze: '#CD7F32' // Bronce
  },

  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    light: '#F8F9FA',
    gray: '#6C757D',
    dark: '#343A40',
    black: '#000000'
  },

  // Status Colors (aligned with CSI brand)
  status: {
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#17A2B8'
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #1B365C 0%, #2B4F7D 100%)',
    secondary: 'linear-gradient(135deg, #C8102E 0%, #E8415A 100%)',
    accent: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
    background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)'
  },

  // Company Specific Colors
  companies: {
    buzzword: {
      primary: '#2B4F7D', // CSI Blue variant
      secondary: '#D4AF37' // CSI Gold
    },
    inovitz: {
      primary: '#C8102E', // CSI Red
      secondary: '#1B365C' // CSI Blue
    }
  }
};

// Role-based color assignments using CSI palette
export const RoleColors = {
  admin: {
    background: CSIColors.gradients.primary,
    color: CSIColors.primary.main,
    badge: CSIColors.primary.main
  },
  user: {
    background: CSIColors.gradients.secondary,
    color: CSIColors.secondary.main,
    badge: CSIColors.secondary.main
  },
  viewer: {
    background: CSIColors.gradients.accent,
    color: CSIColors.accent.gold,
    badge: CSIColors.accent.gold
  }
};

// Chart color palette using CSI colors
export const ChartColors = {
  primary: [
    CSIColors.primary.main,
    CSIColors.secondary.main,
    CSIColors.accent.gold,
    CSIColors.primary.light,
    CSIColors.secondary.light
  ],
  financial: {
    income: CSIColors.status.success,
    expense: CSIColors.secondary.main,
    profit: CSIColors.primary.main,
    growth: CSIColors.accent.gold
  }
};
