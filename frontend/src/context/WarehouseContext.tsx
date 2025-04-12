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
  const [prefetchedProduct, setPrefetchedProducts] = useState<{ [key: string]: BlueprintData | null }>({});

  const setPrefetchedProduct = (itemId: string, data: BlueprintData | null) => {
    setPrefetchedProducts(prev => ({
      ...prev,
      [itemId]: data
    }));
  };

  const clearPrefetchedProduct = (itemId: string) => {
    setPrefetchedProducts(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  };

  return (
    <WarehouseContext.Provider value={{
      nameFilter,
      setNameFilter,
      lastScrollPosition,
      setLastScrollPosition,
      prefetchedProduct,
      setPrefetchedProduct,
      clearPrefetchedProduct,
    }}>
      {children}
    </WarehouseContext.Provider>
  );
}; 