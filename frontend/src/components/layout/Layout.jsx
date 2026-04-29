import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const location = useLocation();
  // Hide sidebar on the landing page or auth pages
  const isPublicPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';
  const isLanding = location.pathname === '/';

  return (
    <div className={`w-full flex min-h-screen ${!isLanding ? 'pt-[52px]' : ''}`}>
      {!isPublicPage && <Sidebar />}
      
      <main className={`flex-1 ${!isPublicPage ? 'p-8 ml-64' : isLanding ? '' : 'p-8'} z-30 relative overflow-y-auto w-full`}>
        {children}
      </main>
    </div>
  );
}
