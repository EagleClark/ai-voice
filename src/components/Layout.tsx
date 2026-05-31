import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Link,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { DarkMode, LightMode, Settings, Home, Menu as MenuIcon } from '@mui/icons-material';
import { useThemeMode } from '../theme/ThemeContext';
import type { ReactNode } from 'react';

interface Props {
  currentPage: 'home' | 'settings';
  onNavigate: (page: 'home' | 'settings') => void;
  children: ReactNode;
}

export default function Layout({ currentPage, onNavigate, children }: Props) {
  const { mode, toggleTheme } = useThemeMode();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 1, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', flexGrow: 1 }}>
            MiMo Voice Studio
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              startIcon={<Home />}
              onClick={() => onNavigate('home')}
              variant={currentPage === 'home' ? 'outlined' : 'text'}
              color="inherit"
            >
              首页
            </Button>
            <Button
              size="small"
              startIcon={<Settings />}
              onClick={() => onNavigate('settings')}
              variant={currentPage === 'settings' ? 'outlined' : 'text'}
              color="inherit"
            >
              设置
            </Button>
          </Box>

          <IconButton onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 220, pt: 2 }}>
          <List>
            <ListItemButton
              selected={currentPage === 'home'}
              onClick={() => { onNavigate('home'); setDrawerOpen(false); }}
            >
              <ListItemIcon><Home /></ListItemIcon>
              <ListItemText primary="首页" />
            </ListItemButton>
            <ListItemButton
              selected={currentPage === 'settings'}
              onClick={() => { onNavigate('settings'); setDrawerOpen(false); }}
            >
              <ListItemIcon><Settings /></ListItemIcon>
              <ListItemText primary="设置" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1, py: 3 }}>
        <Container maxWidth="lg">{children}</Container>
      </Box>

      <Box component="footer" sx={{ py: 2, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          Powered by{' '}
          <Link href="https://platform.xiaomimimo.com/" target="_blank" rel="noreferrer" underline="hover">
            MiMo API
          </Link>
          {' '}&middot; Created by{' '}
          <Link href="https://eagle90.com" target="_blank" rel="noreferrer" underline="hover">
            Eagle Clark
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
