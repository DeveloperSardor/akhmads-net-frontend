import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      setIsChecking(true);
      await checkAuth();
      setIsChecking(false);
    };

    verifyAuth();
  }, [checkAuth]);

  // ⏳ Loading holati
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-300 mx-auto mb-4"></div>
          <p className="text-white/70 text-sm">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // 🚫 Agar token yo'q bo'lsa - login ga yo'naltirish
  if (!isAuthenticated) {
    const currentLang = location.pathname.split('/')[1] || 'uz';
    return <Navigate to={`/${currentLang}/login`} state={{ from: location }} replace />;
  }

  // ✅ Token mavjud bo'lsa - children ni ko'rsatish
  return <>{children}</>;
};

export default ProtectedRoute;