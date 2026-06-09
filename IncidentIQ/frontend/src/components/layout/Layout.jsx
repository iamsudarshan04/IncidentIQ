import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans overflow-x-hidden cloud-bg relative">
      
      {/* Background radial glows for premium depth */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-blue-100/40 blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-100/40 blur-[120px] mix-blend-multiply" />
      </div>

      {/* Floating Navigation Wrapper */}
      <div className="w-full pt-6 px-4 md:px-8 relative z-50 flex justify-center">
        <TopNav />
      </div>

      <main className="flex-1 w-full relative z-10 flex flex-col">
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex items-center justify-center pointer-events-none">
          <div className="w-full h-full pointer-events-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
