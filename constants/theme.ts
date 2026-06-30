/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const BrandColors = {
  standard: '#9900FF', // C40 M100
  aux1: '#4DFFB3', // C70 Y30
  aux2: '#0033CC', // C100 M80 Y20
  aux3: '#B300FF', // C30 M100 (assumed)
  aux4: '#FF80B2', // M50 Y30
  aux5: '#FFCC66', // M20 Y60
  black: '#000000', // K100
};

// 完整设计系统
export const DesignSystem = {
  // 色彩系统
  colors: {
    primary: BrandColors.standard, // #9900FF
    primaryLight: '#F3E8FF',
    primaryExtraLight: '#FAF5FF',
    primaryDark: '#7700BB',
    secondary: BrandColors.aux1, // #4DFFB3
    accent: BrandColors.aux2, // #0033CC
    
    // 中性色
    text: {
      primary: '#1F1143',
      secondary: '#6D5B93',
      tertiary: '#A799C6',
      disabled: '#D4C9E6',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F8F7FB',
      tertiary: '#F0EBFF',
    },
    border: {
      light: '#E8DFFF',
      medium: '#D9CCFF',
      dark: '#C0A8FF',
    },
    state: {
      error: '#FF3B30',
      success: '#34C759',
      warning: '#FF9500',
      info: BrandColors.aux2,
    },
    shadow: '#000000',
  },
  
  // 间距系统
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  
  // 圆角
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 9999,
  },
  
  // 排版
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '700' as const,
      lineHeight: 28,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 26,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
  },
  
  // 阴影
  shadow: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
