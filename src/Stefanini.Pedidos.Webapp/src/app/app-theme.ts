import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const AppTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
    colorScheme: {
      dark: {
        surface: {
          0: '#ffffff',
          50: '#f3f7ff',
          100: '#e5edff',
          200: '#cbdafb',
          300: '#a8bee9',
          400: '#7899d0',
          500: '#5277b2',
          600: '#38598f',
          700: '#263f69',
          800: '#172b4d',
          900: '#0d1d38',
          950: '#061127',
        },
      },
    },
  },
});
