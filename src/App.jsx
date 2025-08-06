import React, { createContext, useEffect, useState } from "react";
import { Route, BrowserRouter, Routes, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import "@/index.css";
import Layout from "@/components/organisms/Layout";
import Employees from "@/components/pages/Employees";
import LeaveManagement from "@/components/pages/LeaveManagement";
import Login from "@/components/pages/Login";
import PromptPassword from "@/components/pages/PromptPassword";
import Reports from "@/components/pages/Reports";
import ResetPassword from "@/components/pages/ResetPassword";
import Callback from "@/components/pages/Callback";
import Dashboard from "@/components/pages/Dashboard";
import ErrorPage from "@/components/pages/ErrorPage";
import Signup from "@/components/pages/Signup";
import Attendance from "@/components/pages/Attendance";
import { clearUser, setUser } from "@/store/userSlice";

// Create auth context
export const AuthContext = createContext(null);

function AppContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  // Get authentication status with proper error handling
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;
  
  // Initialize ApperUI once when the app loads
useEffect(() => {
    let initializationTimeout;
    
    // Enhanced SDK availability check with timeout and retry mechanism
    const checkSDKAvailability = () => {
      if (!window.ApperSDK) {
        const errorMsg = "ApperSDK not loaded - network connectivity issue or script loading failure";
        console.error(errorMsg);
        console.error("CDN URL being used:", import.meta.env.VITE_APPER_SDK_CDN_URL);
        console.error("Check: 1) Internet connection 2) CDN accessibility 3) Script tag in index.html");
        setInitError("SDK loading failed - check network connection");
        setIsInitialized(true);
        return false;
      }
      return true;
    };

    const initializeSDK = async () => {
      // Set timeout for initialization
      initializationTimeout = setTimeout(() => {
        console.error("SDK initialization timeout - taking too long to respond");
        setInitError("Connection timeout - please check your network");
        setIsInitialized(true);
      }, 10000); // 10 second timeout
      
      try {
        // Wait a moment for SDK to be fully loaded
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!checkSDKAvailability()) {
          clearTimeout(initializationTimeout);
          return;
        }
        
        const { ApperClient, ApperUI } = window.ApperSDK;
        
        if (!ApperClient || !ApperUI) {
          const errorMsg = "ApperSDK components incomplete - partial loading detected";
          console.error(errorMsg);
          console.error("Available SDK properties:", Object.keys(window.ApperSDK || {}));
          setInitError("SDK components missing - please refresh the page");
          setIsInitialized(true);
          clearTimeout(initializationTimeout);
          return;
        }

        // Verify environment variables are available
        if (!import.meta.env.VITE_APPER_PROJECT_ID || !import.meta.env.VITE_APPER_PUBLIC_KEY) {
          const errorMsg = "Missing required environment variables";
          console.error(errorMsg);
          console.error("VITE_APPER_PROJECT_ID:", import.meta.env.VITE_APPER_PROJECT_ID ? "✓" : "✗");
          console.error("VITE_APPER_PUBLIC_KEY:", import.meta.env.VITE_APPER_PUBLIC_KEY ? "✓" : "✗");
          setInitError("Configuration error - missing environment variables");
          setIsInitialized(true);
          clearTimeout(initializationTimeout);
          return;
        }

        const client = new ApperClient({
          apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
          apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
        });
        
        // Initialize ApperUI with enhanced error handling
        ApperUI.setup(client, {
          target: '#authentication',
          clientId: import.meta.env.VITE_APPER_PROJECT_ID,
          view: 'both',
          onSuccess: function (user) {
            clearTimeout(initializationTimeout);
            setInitError(null);
            setIsInitialized(true);
            // CRITICAL: This exact currentPath logic must be preserved in all implementations
            // DO NOT simplify or modify this pattern as it ensures proper redirection flow
            let currentPath = window.location.pathname + window.location.search;
            let redirectPath = new URLSearchParams(window.location.search).get('redirect');
            const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || 
                               currentPath.includes('/callback') || currentPath.includes('/error') || 
                               currentPath.includes('/prompt-password') || currentPath.includes('/reset-password');
            
            if (user) {
              // User is authenticated
              if (redirectPath) {
                navigate(redirectPath);
              } else if (!isAuthPage) {
                if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
                  navigate(currentPath);
                } else {
                  navigate('/');
                }
              } else {
                navigate('/');
              }
              // Store user information in Redux
              dispatch(setUser(JSON.parse(JSON.stringify(user))));
            } else {
              // User is not authenticated
              if (!isAuthPage) {
                navigate(
                  currentPath.includes('/signup')
                    ? `/signup?redirect=${currentPath}`
                    : currentPath.includes('/login')
                    ? `/login?redirect=${currentPath}`
                    : '/login'
                );
              } else if (redirectPath) {
                if (
                  !['error', 'signup', 'login', 'callback', 'prompt-password', 'reset-password'].some((path) => currentPath.includes(path))
                ) {
                  navigate(`/login?redirect=${redirectPath}`);
                } else {
                  navigate(currentPath);
                }
              } else if (isAuthPage) {
                navigate(currentPath);
              } else {
                navigate('/login');
              }
              dispatch(clearUser());
            }
          },
          onError: function(error) {
            clearTimeout(initializationTimeout);
            console.error("Authentication setup failed:", error);
            if (error?.message?.includes('Network') || error?.name === 'NetworkError') {
              setInitError("Network connection failed - check your internet connection");
            } else {
              setInitError("Authentication service unavailable - please try again");
            }
            setIsInitialized(true);
          }
        });
      } catch (error) {
        clearTimeout(initializationTimeout);
        console.error("Failed to initialize ApperSDK:", error);
        
        // Detailed error classification
        if (error.name === 'NetworkError' || error.message.includes('Network') || error.message.includes('fetch')) {
          console.error("Network connectivity issue - check internet connection and CDN availability");
          setInitError("Network error - unable to connect to authentication service");
        } else if (error.message.includes('timeout') || error.name === 'TimeoutError') {
          console.error("Connection timeout - server took too long to respond");
          setInitError("Connection timeout - please check your network speed");
        } else if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
          console.error("CORS policy issue - check domain configuration");
          setInitError("Domain configuration error - contact support");
        } else {
          console.error("Unknown initialization error:", error.message);
          setInitError("Initialization failed - please refresh the page");
        }
        
        setIsInitialized(true);
      }
    };

    // Start initialization
    initializeSDK();

    // Cleanup timeout on unmount
    return () => {
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
      }
    };
  }, [navigate, dispatch]);
  
  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };
  
// Don't render routes until initialization is complete
if (!isInitialized) {
    return (
      <div className="loading flex flex-col items-center justify-center p-6 h-full w-full">
        <svg className="animate-spin mb-4" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4"></path><path d="m16.2 7.8 2.9-2.9"></path><path d="M18 12h4"></path><path d="m16.2 16.2 2.9 2.9"></path><path d="M12 18v4"></path><path d="m4.9 19.1 2.9-2.9"></path><path d="M2 12h4"></path><path d="m4.9 4.9 2.9 2.9"></path>
        </svg>
        <div className="text-sm text-gray-600 text-center">
          <div>Initializing TeamFlow...</div>
          {initError && (
            <div className="mt-2 text-red-600 font-medium">{initError}</div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <AuthContext.Provider value={authMethods}>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/prompt-password/:appId/:emailAddress/:provider" element={<PromptPassword />} />
          <Route path="/reset-password/:appId/:fields" element={<ResetPassword />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leave-management" element={<LeaveManagement />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 9999 }}
        />
      </div>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;