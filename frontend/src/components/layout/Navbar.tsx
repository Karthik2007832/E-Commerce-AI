'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingCart, User, Search, Menu, Package } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/store';

const Navbar = () => {
  const { itemsByUser } = useCartStore();
  const { user } = useAuthStore();
  
  const userId = user?.id || 'guest';
  const items = itemsByUser[userId] || [];
  
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/');
    }
  };
  
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 hidden sm:block">
              AI<span className="text-blue-600">Mart</span>
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-all sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Link href="/login" className="flex items-center space-x-1 text-slate-700 hover:text-blue-600 transition-colors">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium hidden lg:block">
                {user ? user.username : 'Login'}
              </span>
            </Link>
            
            <Link href="/orders" className="flex items-center space-x-1 text-slate-700 hover:text-blue-600 transition-colors" title="Purchase History">
              <Package className="h-5 w-5" />
              <span className="text-sm font-medium hidden lg:block">Orders</span>
            </Link>
            
            <Link href="/cart" className="relative p-2 text-slate-700 hover:text-blue-600 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-blue-600 rounded-full">
                  {items.length}
                </span>
              )}
            </Link>
            
            <button className="md:hidden p-2 text-slate-700">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
