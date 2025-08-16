// 主题配置文件 - 紫色系
export const themeConfig = {
  // 浅色模式颜色 - 紫色系
  light: {
    primary: {
      main: '#a855f7',      // 主色调 - 紫色
      light: '#c084fc',     // 浅色
      dark: '#9333ea',      // 深色
      contrast: '#ffffff',  // 对比色（文字颜色）
    },
    secondary: {
      main: '#64748b',
      light: '#94a3b8',
      dark: '#475569',
      contrast: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#faf5ff',     // 淡紫色背景
      card: '#f3e8ff',      // 更淡的紫色背景
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      disabled: '#94a3b8',
    },
  },
  
  // 深色模式颜色 - 紫色系
  dark: {
    primary: {
      main: '#c084fc',      // 主色调 - 浅紫色
      light: '#d8b4fe',     // 浅色
      dark: '#a855f7',      // 深色
      contrast: '#0f172a',
    },
    secondary: {
      main: '#94a3b8',
      light: '#cbd5e1',
      dark: '#64748b',
      contrast: '#0f172a',
    },
    background: {
      default: '#0f172a',
      paper: '#1e1b4b',     // 深紫色背景
      card: '#312e81',      // 中等紫色背景
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      disabled: '#64748b',
    },
  },
};

// 预设主题 - 紫色系为主
export const presetThemes = {
  purple: {
    light: '#a855f7',
    dark: '#c084fc',
  },
  blue: {
    light: '#3b82f6',
    dark: '#60a5fa',
  },
  green: {
    light: '#10b981',
    dark: '#34d399',
  },
  red: {
    light: '#ef4444',
    dark: '#f87171',
  },
  orange: {
    light: '#f97316',
    dark: '#fb923c',
  },
  pink: {
    light: '#ec4899',
    dark: '#f472b6',
  },
};

// 获取当前主题颜色 - 默认紫色
export function getThemeColor(theme = 'purple') {
  return presetThemes[theme] || presetThemes.purple;
}
