import { Theme } from '@react-navigation/native';
import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';


const WEB_FONT_STACK =
    'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

export const fonts = Platform.select({
  web: {
    regular: {
      fontFamily: WEB_FONT_STACK,
      fontWeight: '400',
    },
    medium: {
      fontFamily: WEB_FONT_STACK,
      fontWeight: '500',
    },
    bold: {
      fontFamily: WEB_FONT_STACK,
      fontWeight: '600',
    },
    heavy: {
      fontFamily: WEB_FONT_STACK,
      fontWeight: '700',
    },
  },
  ios: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '600',
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '700',
    },
  },
  default: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal',
    },
    bold: {
      fontFamily: 'sans-serif',
      fontWeight: '600',
    },
    heavy: {
      fontFamily: 'sans-serif',
      fontWeight: '700',
    },
  },
} as const satisfies Record<string, Theme['fonts']>);



export const DarkTheme: Theme = {
  dark: true,
  colors: {
    primary: 'rgb(10, 132, 255)',
    background: "#0F172A",
    card: 'rgb(18, 18, 18)',
    text: 'rgb(229, 229, 231)',
    border: 'rgb(39, 39, 41)',
    notification: 'rgb(255, 69, 58)',
  },
  fonts
};


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
    text: '#F8FAFC',
    background: '#0F172A',
    tint: tintColorDark,
    icon: '#38BDF8',
    tabIconDefault: '#38BDF8',
    tabIconSelected: tintColorDark,
  },
};
