import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BlueprintData } from '../types/blueprint';

interface WarehouseContextType {
  nameFilter: string;
  setNameFilter: (filter: string) => void;
  lastScrollPosition: number;
  setLastScrollPosition: (position: number) => void;
  prefetchedProduct: { [key: string]: BlueprintData | null };
  setPrefetchedProduct: (itemId: string, data: BlueprintData | null) => void;
  clearPrefetchedProduct: (itemId: string) => void;
  isRefreshing: boolean;
  isProcessing: boolean;
  refreshPromise: Promise<void> | null;
  processPromise: Promise<void> | null;
  fetchAll: () => Promise<void>;
  processWarehouse: () => Promise<void>;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};

interface WarehouseProviderProps {
  children: ReactNode;
}

export const WarehouseProvider: React.FC<WarehouseProviderProps> = ({ children }) => {
  const [nameFilter, setNameFilter] = useState('');
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [prefetchedProducts] = useState<Record<string, BlueprintData | null>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshPromise, setRefreshPromise] = useState<Promise<void> | null>(null);
  const [processPromise, setProcessPromise] = useState<Promise<void> | null>(null);

  const setPrefetchedProduct = (itemId: string, data: BlueprintData | null) => {
    prefetchedProducts[itemId] = data;
  };

  const clearPrefetchedProduct = (itemId: string) => {
    delete prefetchedProducts[itemId];
  };

  const fetchAll = async (): Promise<void> => {
    if (isRefreshing) return refreshPromise || Promise.resolve();
    
    setIsRefreshing(true);
    const promise = fetch('/api/data/fetch-all', {
      method: 'POST',
      credentials: 'include',
    }).then(async (response) => {
      if (!response.ok) throw new Error('Failed to refresh data');
    }).finally(() => {
      setIsRefreshing(false);
      setRefreshPromise(null);
    });
    
    setRefreshPromise(promise);
    return promise;
  };

  const processWarehouse = async (): Promise<void> => {
    if (isProcessing) return processPromise || Promise.resolve();
    
    setIsProcessing(true);
    const promise = fetch('/api/warehouse/processAll', {
      method: 'POST',
      credentials: 'include',
    }).then(async (response) => {
      if (!response.ok) throw new Error('Failed to process warehouse data');
    }).finally(() => {
      setIsProcessing(false);
      setProcessPromise(null);
    });
    
    setProcessPromise(promise);
    return promise;
  };

  return (
    <WarehouseContext.Provider
      value={{
        nameFilter,
        setNameFilter,
        lastScrollPosition,
        setLastScrollPosition,
        prefetchedProduct: prefetchedProducts,
        setPrefetchedProduct,
        clearPrefetchedProduct,
        isRefreshing,
        isProcessing,
        refreshPromise,
        processPromise,
        fetchAll,
        processWarehouse,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
}; 