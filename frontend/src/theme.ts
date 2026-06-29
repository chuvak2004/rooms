import { createTheme } from "@mui/material/styles";

export const brand = {
  name: "Atrium",
  tagline: "Управление пространствами",
};

export const palette = {
  sidebar: "#0b1220",
  sidebarHover: "#15203a",
  accent: "#22c55e",
  accentSoft: "#dcfce7",
  surface: "#f4f6fb",
  card: "#ffffff",
  border: "#e6e9f0",
  text: "#0f1729",
  muted: "#64748b",
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: palette.accent, contrastText: "#04130a" },
    secondary: { main: "#0b1220" },
    background: { default: palette.surface, paper: palette.card },
    text: { primary: palette.text, secondary: palette.muted },
    success: { main: "#16a34a" },
    warning: { main: "#f59e0b" },
    error: { main: "#ef4444" },
    divider: palette.border,
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
    h4: { fontWeight: 800, letterSpacing: -0.5 },
    h5: { fontWeight: 800, letterSpacing: -0.3 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 12, paddingInline: 18, paddingBlock: 9 },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 12, background: "#fff" },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, color: palette.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6 },
        root: { borderColor: palette.border },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
  },
});
