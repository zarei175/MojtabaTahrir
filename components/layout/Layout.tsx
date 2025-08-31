'use client';

import React from 'react';
import { Inter } from 'next/font/google';
import Header from '../common/Header';
import Footer from '../common/Footer';
import ErrorBoundary from '../common/ErrorBoundary';
import { Category } from '../../types';

const inter = Inter({ subsets: ['latin'] });

interface LayoutProps {
  children: React.ReactNode;
  categories?: Category[];
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  categories = [],
  showHeader = true,
  showFooter = true,
  className = ''
}) => {
  return (
    <div className={`min-h-screen flex flex-col ${inter.className} ${className}`}>
      <ErrorBoundary>
        {showHeader && <Header categories={categories} />}
        
        <main className="flex-1">
          {children}
        </main>
        
        {showFooter && <Footer />}
      </ErrorBoundary>
    </div>
  );
};

export default Layout;
