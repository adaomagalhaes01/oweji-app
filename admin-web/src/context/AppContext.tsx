import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialOrders, initialProducts, initialStores, demoUsers } from '../data/mockData';
import { Order, Product, Store, User, UserRole } from '../types';
import { OrderStatus } from '../constants/order-status';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchRole: (role: UserRole, merchantStoreId?: string) => void;
  stores: Store[];
  products: Product[];
  orders: Order[];
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, newStock: number) => void;
  
  // Order actions
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  validatePayment: (orderId: string, approved: boolean, note?: string) => void;
  
  // Store actions
  updateStore: (id: string, updates: Partial<Store>) => void;
  approveStore: (id: string) => void;
  suspendStore: (id: string) => void;
  
  // Notification / Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'oweji_admin_user',
  ORDERS: 'oweji_admin_orders',
  PRODUCTS: 'oweji_admin_products',
  STORES: 'oweji_admin_stores',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return demoUsers.admin; // Default to Admin
  });

  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STORES);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return initialStores;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return initialProducts;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return initialOrders;
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      showToast(`Sessão iniciada como ${user.name} (${user.role === 'admin' ? 'Administrador' : 'Comerciante'})`);
    }
  };

  const switchRole = (role: UserRole, merchantStoreId?: string) => {
    if (role === 'admin') {
      setCurrentUser(demoUsers.admin);
    } else {
      if (merchantStoreId === 'STORE-KILAMBA') {
        setCurrentUser(demoUsers.merchantKilamba);
      } else {
        setCurrentUser(demoUsers.merchantRosa);
      }
    }
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now().toString(36)}`,
      createdAt: Date.now(),
      views: 0,
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Produto "${newProduct.name}" publicado com sucesso!`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    showToast('Produto atualizado com sucesso!');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    showToast('Produto removido do catálogo.', 'info');
  };

  const updateStock = (id: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: Math.max(0, newStock) } : item))
    );
    showToast('Quantidade de stock atualizada!');
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    );
    showToast(`Estado da encomenda #${orderId.slice(-5)} atualizado!`);
  };

  const validatePayment = (orderId: string, approved: boolean, note?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: approved ? 'confirmed' : 'cancelled',
            validatedAt: Date.now(),
            validationNotes: note || (approved ? 'Pagamento por transferência bancária confirmado pela administração.' : 'Comprovativo rejeitado.'),
          };
        }
        return order;
      })
    );
    if (approved) {
      showToast(`Comprovativo validado! Encomenda #${orderId.slice(-5)} avançada para CONFIRMADO.`);
    } else {
      showToast(`Comprovativo rejeitado para a encomenda #${orderId.slice(-5)}.`, 'error');
    }
  };

  const updateStore = (id: string, updates: Partial<Store>) => {
    setStores((prev) =>
      prev.map((store) => (store.id === id ? { ...store, ...updates } : store))
    );
    showToast('Dados da loja atualizados!');
  };

  const approveStore = (id: string) => {
    setStores((prev) =>
      prev.map((store) => (store.id === id ? { ...store, status: 'active' } : store))
    );
    showToast('Loja aprovada com sucesso para operar no Marketplace!');
  };

  const suspendStore = (id: string) => {
    setStores((prev) =>
      prev.map((store) => (store.id === id ? { ...store, status: 'suspended' } : store))
    );
    showToast('Loja suspensa temporariamente.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        stores,
        products,
        orders,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        updateOrderStatus,
        validatePayment,
        updateStore,
        approveStore,
        suspendStore,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
