import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Alert, Snackbar } from '@mui/material';

// Components
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Trading from './pages/Trading';
import Profile from './pages/Profile';

// Services
import { initializeWeb3, getAccount } from './services/web3';
import { connectToBlockchain } from './services/blockchain';

// Styles
import './styles/globals.css';

/**
 * SolChain App Component
 * BCOLBD 2025 - Team GreyDevs
 * Main application component with Web3 integration
 */
const App = () => {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [contracts, setContracts] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Material-UI theme
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#4CAF50', // Green for solar energy
        dark: '#388E3C',
        light: '#81C784',
      },
      secondary: {
        main: '#FF9800', // Orange for energy
        dark: '#F57F17',
        light: '#FFB74D',
      },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
        },
      },
    },
  });

  // Initialize Web3 and blockchain connection
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Check if MetaMask is available
        if (typeof window.ethereum === 'undefined') {
          showNotification('MetaMask is required to use SolChain. Please install MetaMask.', 'warning');
          setIsLoading(false);
          return;
        }

        // Initialize Web3
        const web3Instance = await initializeWeb3();
        setWeb3(web3Instance);

        // Try to get current account
        const accounts = await getAccount();
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          
          // Initialize smart contracts
          const contractInstances = await connectToBlockchain(web3Instance);
          setContracts(contractInstances);
          
          showNotification('Successfully connected to SolChain!', 'success');
        } else {
          showNotification('Please connect your MetaMask wallet to continue.', 'info');
        }
      } catch (error) {
        console.error('App initialization error:', error);
        showNotification('Failed to initialize application. Please check your connection.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          showNotification('Account changed successfully!', 'info');
        } else {
          setAccount(null);
          setIsConnected(false);
          showNotification('Please connect your wallet.', 'warning');
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (!web3) {
        showNotification('Web3 not initialized. Please refresh the page.', 'error');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Initialize contracts after connection
        const contractInstances = await connectToBlockchain(web3);
        setContracts(contractInstances);
        
        showNotification('Wallet connected successfully!', 'success');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      showNotification('Failed to connect wallet. Please try again.', 'error');
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setContracts({});
    showNotification('Wallet disconnected.', 'info');
  };

  // Show notification function
  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // App props to pass to components
  const appProps = {
    isConnected,
    account,
    web3,
    contracts,
    connectWallet,
    disconnectWallet,
    showNotification,
  };

  // Show loading spinner during initialization
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingSpinner message="Initializing SolChain..." />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {/* Header */}
          <Header
            isConnected={isConnected}
            account={account}
            onConnectWallet={connectWallet}
            onDisconnectWallet={disconnectWallet}
            onToggleSidebar={toggleSidebar}
          />

          {/* Sidebar */}
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isConnected={isConnected}
          />

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              marginTop: '64px', // Height of header
              marginLeft: sidebarOpen ? '240px' : '0px',
              transition: 'margin-left 0.3s ease',
            }}
          >
            <Routes>
              <Route 
                path="/" 
                element={<Home {...appProps} />} 
              />
              <Route 
                path="/dashboard" 
                element={
                  isConnected ? (
                    <Dashboard {...appProps} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                } 
              />
              <Route 
                path="/trading" 
                element={
                  isConnected ? (
                    <Trading {...appProps} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                } 
              />
              <Route 
                path="/profile" 
                element={
                  isConnected ? (
                    <Profile {...appProps} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                } 
              />
              {/* Redirect unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>

          {/* Notification Snackbar */}
          <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={handleCloseNotification}
              severity={notification.severity}
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;