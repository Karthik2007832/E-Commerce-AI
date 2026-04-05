'use client';
import React from 'react';
import { useAuthStore, useCartStore } from '@/store';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const CartPage = () => {
  const { user } = useAuthStore();
  const userId = user?.id || 'guest';
  const { itemsByUser, addItem, removeItem, clearCart } = useCartStore();
  const items = itemsByUser[userId] || [];

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-sm inline-block">
          <ShoppingBag className="h-16 w-16 text-slate-200 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2"> Your cart is empty</h2>
          <p className="text-slate-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/" className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition">
            <span>Start Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-10">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl flex items-center space-x-6 border border-slate-100 group">
              <div className="w-24 h-24 bg-slate-50 rounded-xl p-2 flex items-center justify-center shrink-0">
                <img src={item.image} alt={item.title} className="h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 line-clamp-1">{item.title}</h3>
                <p className="text-blue-600 font-bold mt-1">${item.price}</p>
                
                {/* Quantity Controls */}
                <div className="flex items-center space-x-3 mt-4">
                  <button className="p-1 rounded-md border border-slate-200 hover:bg-slate-50">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-medium text-slate-700">{item.quantity}</span>
                  <button className="p-1 rounded-md border border-slate-200 hover:bg-slate-50">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button 
                onClick={() => removeItem(userId, item.id)}
                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button 
            onClick={() => clearCart(userId)}
            className="text-slate-400 hover:text-red-500 text-sm font-medium transition ml-2"
          >
            Clear Cart
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 sticky top-24">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t border-slate-100 pt-4 flex justify-between font-bold text-xl text-slate-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-2xl transition active:scale-95">
              Checkout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
