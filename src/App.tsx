import { useEffect, useState } from 'react';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { useAuth } from './contexts/AuthContext';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { user, loading } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    const handlePathChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePathChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePathChange);
    };
  }, []);

  useEffect(() => {
    if (user && window.location.pathname === '/') {
      window.history.pushState({}, '', '/dashboard');
      setCurrentPath('/dashboard');
    } else if (!loading && window.location.pathname === '/dashboard' && !user) {
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentPath === '/dashboard') {
    if (!user) {
      return <HomePage />;
    }
    return <DashboardPage />;
  }

  return <HomePage />;
}

export default App;
