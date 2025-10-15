import React, { useState } from 'react';

interface Tab {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultActiveTab?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  tabListClassName?: string;
  tabButtonClassName?: string;
  tabContentClassName?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'boxed' | 'underline';
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActiveTab,
  orientation = 'horizontal',
  className = '',
  tabListClassName = '',
  tabButtonClassName = '',
  tabContentClassName = '',
  onTabChange,
  variant = 'default'
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultActiveTab || tabs[0]?.id || '');

  const handleTabChange = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && !tab.disabled) {
      setActiveTab(tabId);
      if (onTabChange) {
        onTabChange(tabId);
      }
    }
  };

  if (tabs.length === 0) {
    return null;
  }

  const isVertical = orientation === 'vertical';

  // Determine styling based on variant
  const getTabButtonClasses = (tabId: string, disabled: boolean = false) => {
    let baseClasses = 'font-medium text-sm transition-colors duration-200 ';
    
    if (variant === 'boxed') {
      baseClasses += disabled 
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed ' 
        : 'hover:bg-gray-100 cursor-pointer ';
      
      baseClasses += activeTab === tabId
        ? 'bg-blue-100 text-blue-700 border border-gray-300 '
        : 'bg-white text-gray-700 border border-transparent ';
    } else if (variant === 'underline') {
      baseClasses += disabled 
        ? 'text-gray-400 cursor-not-allowed ' 
        : 'hover:text-gray-700 cursor-pointer ';
      
      baseClasses += activeTab === tabId
        ? 'text-blue-600 border-b-2 border-blue-600 '
        : 'text-gray-500 ';
    } else { // default
      baseClasses += disabled 
        ? 'text-gray-400 cursor-not-allowed ' 
        : 'hover:text-gray-700 cursor-pointer ';
      
      baseClasses += activeTab === tabId
        ? 'text-blue-600 border-b-2 border-blue-600 '
        : 'text-gray-500 ';
    }

    // Add padding and other layout classes based on orientation
    if (isVertical) {
      baseClasses += 'py-3 px-4 text-left w-full ';
    } else {
      baseClasses += 'px-4 py-2 ';
    }

    return baseClasses + tabButtonClassName;
  };

  return (
    <div className={`tabs-container ${isVertical ? 'flex' : ''} ${className}`}>
      <div 
        className={`
          ${isVertical 
            ? 'flex-col w-48 border-r border-gray-200' 
            : 'flex flex-wrap border-b border-gray-200'
          } 
          ${tabListClassName}
        `}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={getTabButtonClasses(tab.id, tab.disabled)}
            onClick={() => handleTabChange(tab.id)}
            disabled={tab.disabled}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div 
        className={`tab-content ${isVertical ? 'flex-1 ml-4' : 'mt-4'} ${tabContentClassName}`}
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default Tabs;