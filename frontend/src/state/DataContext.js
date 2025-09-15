import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);

  const fetchItems = useCallback(async (params = {}) => {
    const queryParams = new URLSearchParams({
      limit: "500",
      ...params,
    });

    const res = await fetch(`http://localhost:3001/api/items?${queryParams}`);
    const result = await res.json();

    // Handle both old format (array) and new format (object with data property)
    const itemsData = result.data || result;
    setItems(itemsData);

    return result;
  }, []);

  return (
    <DataContext.Provider value={{ items, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);