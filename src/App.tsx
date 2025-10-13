import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AppRoutes from './components/AppRoutes';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="App min-h-screen flex flex-col">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="bg-gradient-to-br from-blue-50 to-indigo-100 p-0 md:ml-0 transition-all duration-300 w-full overflow-x-auto h-screen">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}

export default App;
