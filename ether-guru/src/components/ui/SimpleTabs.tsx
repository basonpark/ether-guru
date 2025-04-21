"use client";

import React, { createContext, useState, useContext } from "react";

// Context to manage tab state
type TabsContextType = {
  activeTab: string;
  setActiveTab: (id: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

// Simple Tabs component
interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

export function SimpleTabs({ defaultValue, children, className = "" }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

// TabList component
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function SimpleTabsList({ children, className = "" }: TabsListProps) {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 ${className}`}>
      {children}
    </div>
  );
}

// TabTrigger component
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function SimpleTabsTrigger({ value, children, className = "" }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs component");
  }
  
  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;
  
  return (
    <button
      type="button"
      role="tab"
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all
        ${isActive ? 
          'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 
          'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
        }
        ${className}
      `}
      onClick={() => setActiveTab(value)}
      data-state={isActive ? "active" : "inactive"}
    >
      {children}
    </button>
  );
}

// TabContent component
interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function SimpleTabsContent({ value, children, className = "" }: TabsContentProps) {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error("TabsContent must be used within a Tabs component");
  }
  
  const { activeTab } = context;
  
  if (activeTab !== value) {
    return null;
  }
  
  return (
    <div 
      role="tabpanel" 
      className={`mt-2 ${className}`}
      data-state={activeTab === value ? "active" : "inactive"}
    >
      {children}
    </div>
  );
}
