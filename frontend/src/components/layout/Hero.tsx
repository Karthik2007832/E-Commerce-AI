'use client';
import React from 'react';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

const Hero = () => {
  const scrollToProducts = () => {
    const section = document.getElementById('trending-products');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold tracking-wide uppercase">AI-Powered Shopping Experience</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Find the Perfect Products <br />
            <span className="gradient-text">Curated Just for You</span>
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
            Experience the future of E-Commerce with our real-time hybrid recommendation system. 
            Smart. Personalized. Seamless.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={scrollToProducts}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95"
            >
              <span>Start Shopping</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button 
              onClick={scrollToProducts}
              className="flex items-center justify-center space-x-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-8 py-4 rounded-full font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Browse Categories</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
    </div>
  );
};

export default Hero;
