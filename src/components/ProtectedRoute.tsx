import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, checkAuth, user } = useAuthStore();
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

  const currentLang = location.pathname.split('/')[1] || 'uz';

  // 🚫 Agar token yo'q bo'lsa - login ga yo'naltirish
  if (!isAuthenticated) {
    return <Navigate to={`/${currentLang}/login`} state={{ from: location }} replace />;
  }

  // 🚫 Agar ruxsat etilgan rollar berilgan bo'lsa va userning roliga to'g'ri kelmasa
  if (allowedRoles && allowedRoles.length > 0 && user) {
    const userRoles = user.roles || (user.role ? [user.role] : []);
    const hasAllowedRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasAllowedRole) {
      // Yoki 403 sahifasiga, yoki wallet'ga qaytarish mumkin
      return <Navigate to={`/${currentLang}/wallet`} replace />;
    }
  }

  // ✅ Token mavjud va role ruxsat etilgan bo'lsa - children ni ko'rsatish
  return <>{children}</>;
};

export default ProtectedRoute;