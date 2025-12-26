import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { dataDisplayCustomizations } from './customizations/dataDisplay';
import { surfacesCustomizations } from './customizations/surfaces';
import { getDesignTokens } from './themePrimitives';

export default function AppTheme(props) {
  const { children, disableCustomTheme, themeComponents, mode } = props;

  const theme = React.useMemo(() => {
      const tokens = getDesignTokens(mode);
      return createTheme({
          palette: tokens.palette,
          typography: tokens.typography,
          shadows: tokens.shadows,
          shape: tokens.shape,
          components: {
              ...dataDisplayCustomizations,
              ...surfacesCustomizations,
              ...themeComponents,
              MuiPaper: { defaultProps: { variant: 'elevation' } },
              MuiMobileStepper: {
                  defaultProps: { variant: 'dots', },
                  styleOverrides: {
                      dot: {
                          backgroundColor: '#9e9e9e', // inactive dot color
                      },
                      dotActive: {
                          backgroundColor: tokens.palette.cardAccent.dark, // active dot color
                      },
                  },
              },
              MuiGauge: {
                  styleOverrides: {
                      valueArc: {
                          fill: tokens.palette.cardAccent.main
                      },
                  }
              }
            },
        });
  }, [mode, themeComponents]);
  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  return (
    <ThemeProvider theme={theme} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}

