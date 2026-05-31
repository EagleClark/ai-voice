import { useState } from 'react';
import { Box } from '@mui/material';
import { AppThemeProvider } from './theme/ThemeContext';
import { useSettings } from './hooks/useSettings';
import Layout from './components/Layout';
import MainPage from './components/MainPage';
import SettingsPage from './components/SettingsPage';

function App() {
  const { hasApiKey } = useSettings();
  const [page, setPage] = useState<'home' | 'settings'>('home');

  return (
    <AppThemeProvider>
      <Layout currentPage={page} onNavigate={setPage}>
        <Box sx={{ display: page === 'home' ? 'block' : 'none' }}>
          <MainPage hasApiKey={hasApiKey} onOpenSettings={() => setPage('settings')} />
        </Box>
        <Box sx={{ display: page === 'settings' ? 'block' : 'none' }}>
          <SettingsPage onSaved={() => setPage('home')} />
        </Box>
      </Layout>
    </AppThemeProvider>
  );
}

export default App;
