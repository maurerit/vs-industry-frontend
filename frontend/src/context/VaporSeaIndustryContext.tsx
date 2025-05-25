/*
 * MIT License
 *
 * Copyright (c) 2025 VaporSea
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BlueprintData } from '../types/blueprint';

interface VaporSeaIndustryContextType {
  // Original WarehouseContext state
  nameFilter: string;
  setNameFilter: (filter: string) => void;
  lastScrollPosition: number;
  setLastScrollPosition: (position: number) => void;
  prefetchedProduct: { [key: string]: BlueprintData | null };
  setPrefetchedProduct: (itemId: string, data: BlueprintData | null) => void;
  clearPrefetchedProduct: (itemId: string) => void;
  isRefreshing: boolean;
  setIsRefreshing: (isRefreshing: boolean) => void;
  isProcessing: boolean;
  refreshPromise: Promise<void> | null;
  processPromise: Promise<void> | null;
  fetchAll: () => Promise<void>;
  processWarehouse: () => Promise<void>;

  // New state for Products -> Items
  productsPage: number;
  setProductsPage: (page: number) => void;
  productsPageSize: number;
  setProductsPageSize: (pageSize: number) => void;
  productsFilter: string;
  setProductsFilter: (filter: string) => void;

  // New state for Items -> Item
  itemsPage: number;
  setItemsPage: (page: number) => void;
  itemsPageSize: number;
  setItemsPageSize: (pageSize: number) => void;
  itemsSearchField: string;
  setItemsSearchField: (search: string) => void;

  // State for Industry Jobs
  industryJobsPage: number;
  setIndustryJobsPage: (page: number) => void;
  industryJobsPageSize: number;
  setIndustryJobsPageSize: (pageSize: number) => void;
  industryJobsSort: string;
  setIndustryJobsSort: (sort: string) => void;
  industryJobsFinished: boolean;
  setIndustryJobsFinished: (finished: boolean) => void;
}

const VaporSeaIndustryContext = createContext<VaporSeaIndustryContextType | undefined>(undefined);

export const useVaporSeaIndustry = () => {
  const context = useContext(VaporSeaIndustryContext);
  if (!context) {
    throw new Error('useVaporSeaIndustry must be used within a VaporSeaIndustryProvider');
  }
  return context;
};

interface VaporSeaIndustryProviderProps {
  children: ReactNode;
}

export const VaporSeaIndustryProvider: React.FC<VaporSeaIndustryProviderProps> = ({ children }) => {
  // Original WarehouseContext state
  const [nameFilter, setNameFilter] = useState('');
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [prefetchedProducts] = useState<Record<string, BlueprintData | null>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshPromise, setRefreshPromise] = useState<Promise<void> | null>(null);
  const [processPromise, setProcessPromise] = useState<Promise<void> | null>(null);

  // New state for Products -> Items
  const [productsPage, setProductsPage] = useState(0);
  const [productsPageSize, setProductsPageSize] = useState(20);
  const [productsFilter, setProductsFilter] = useState('');

  // New state for Items -> Item
  const [itemsPage, setItemsPage] = useState(0);
  const [itemsPageSize, setItemsPageSize] = useState(20);
  const [itemsSearchField, setItemsSearchField] = useState('');

  // State for Industry Jobs
  const [industryJobsPage, setIndustryJobsPage] = useState(0);
  const [industryJobsPageSize, setIndustryJobsPageSize] = useState(20);
  const [industryJobsSort, setIndustryJobsSort] = useState('endDate,DESC');
  const [industryJobsFinished, setIndustryJobsFinished] = useState(false);

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
    <VaporSeaIndustryContext.Provider
      value={{
        // Original WarehouseContext values
        nameFilter,
        setNameFilter,
        lastScrollPosition,
        setLastScrollPosition,
        prefetchedProduct: prefetchedProducts,
        setPrefetchedProduct,
        clearPrefetchedProduct,
        isRefreshing,
        setIsRefreshing,
        isProcessing,
        refreshPromise,
        processPromise,
        fetchAll,
        processWarehouse,

        // New values for Products -> Items
        productsPage,
        setProductsPage,
        productsPageSize,
        setProductsPageSize,
        productsFilter,
        setProductsFilter,

        // New values for Items -> Item
        itemsPage,
        setItemsPage,
        itemsPageSize,
        setItemsPageSize,
        itemsSearchField,
        setItemsSearchField,

        // Values for Industry Jobs
        industryJobsPage,
        setIndustryJobsPage,
        industryJobsPageSize,
        setIndustryJobsPageSize,
        industryJobsSort,
        setIndustryJobsSort,
        industryJobsFinished,
        setIndustryJobsFinished,
      }}
    >
      {children}
    </VaporSeaIndustryContext.Provider>
  );
};
