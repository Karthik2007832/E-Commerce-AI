'use client';
import React from 'react';
import Image from 'next/image';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useCartStore } from '@/store';
import { interactionApi } from '@/api';
import { useAuthStore } from '@/store';

import Link from 'next/link';

interface ProductCardProps {
  product: {
    externalId: number;
    title: string;
    price: number;
    image: string;
    rating: { rate: number; count: number };
    category: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();
  const { user } = useAuthStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const userId = user?.id || 'guest';
    addItem(userId, { ...product, id: product.externalId, quantity: 1 });
    interactionApi.logInteraction({
      userId: user?.id,
      productId: product.externalId,
      type: 'add-to-cart'
    });
  };

  const handleView = () => {
    interactionApi.logInteraction({
      userId: user?.id,
      productId: product.externalId,
      type: 'view'
    });
  };

  return (
    <Link 
      href={`/product/${product.externalId}`}
      className="premium-card group cursor-pointer block"
      onClick={handleView}
    >
      {/* Product Image */}
      <div className="relative h-64 w-full bg-white flex items-center justify-center p-6 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.title}
          className="h-full object-contain transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/f8fafc/64748b/png?text=Image+Not+Found' }}
        />
        <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:text-red-500 hover:bg-white transition-all transform translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
          <Heart className="h-5 w-5" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
        <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 mb-1 block">
          {product.category}
        </span>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center mt-2 mb-3">
          <div className="flex items-center text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-3 w-3 ${i < Math.floor(product.rating.rate) ? 'fill-current' : ''}`} 
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 ml-1">({product.rating.count})</span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            ${product.price}
          </span>
          <button 
            onClick={handleAddToCart}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-blue-600 text-white rounded-full px-4 py-2 text-xs font-semibold transition-all hover:shadow-lg active:scale-95"
          >
            <ShoppingCart className="h-3 w-3" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
