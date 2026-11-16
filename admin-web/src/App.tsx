import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminFinancialReview } from './pages/admin/AdminFinancialReview';
import { AdminMerchants } from './pages/admin/AdminMerchants';
import { AdminCatalog } from './pages/admin/AdminCatalog';
import { AdminOrders } from './pages/admin/AdminOrders';

// Merchant Pages
import { MerchantDashboard } from './pages/merchant/MerchantDashboard';
import { MerchantProducts } from './pages/merchant/MerchantProducts';
import { MerchantOrders } from './pages/merchant/MerchantOrders';
import { MerchantSales } from './pages/merchant/MerchantSales';
import { MerchantProfile } from './pages/merchant/MerchantProfile';

export const App: React.FC = () => {
  const { currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  const [currentTab, setCurrentTab] = useState<string>(
    isAdmin ? 'admin-dashboard' : 'merchant-dashboard'
  );

  // Sync tab when user changes role
  useEffect(() => {
    if (isAdmin && currentTab.startsWith('merchant-')) {
      setCurrentTab('admin-dashboard');
    } else if (!isAdmin && currentTab.startsWith('admin-')) {
      setCurrentTab('merchant-dashboard');
    }
  }, [isAdmin]);

  const renderContent = () => {
    switch (currentTab) {
      // Admin Views
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={setCurrentTab} />;
      case 'admin-financial':
        return <AdminFinancialReview />;
      case 'admin-merchants':
        return <AdminMerchants />;
      case 'admin-catalog':
        return <AdminCatalog />;
      case 'admin-orders':
        return <AdminOrders />;

      // Merchant Views
      case 'merchant-dashboard':
        return <MerchantDashboard onNavigate={setCurrentTab} />;
      case 'merchant-products':
        return <MerchantProducts />;
      case 'merchant-orders':
        return <MerchantOrders />;
      case 'merchant-sales':
        return <MerchantSales />;
      case 'merchant-profile':
        return <MerchantProfile />;

      default:
        return isAdmin ? (
          <AdminDashboard onNavigate={setCurrentTab} />
        ) : (
          <MerchantDashboard onNavigate={setCurrentTab} />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FFF8FA] text-[#252225] font-sans antialiased">
      {/* Fixed Left Navigation */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar currentTab={currentTab} onSelectTab={setCurrentTab} />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
