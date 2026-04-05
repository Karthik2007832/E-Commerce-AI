'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { productApi, interactionApi } from '@/api';
import Navbar from '@/components/layout/Navbar';
import { Loader2, CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';
import { useAuthStore } from '@/store';
import ProductCard from '@/components/product/ProductCard';

const OrderSuccessContent = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuthStore();

  useEffect(() => {
    const processOrderSuccess = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // 1. Fetch purchased product details
        const res = await productApi.getProduct(productId);
        const boughtProduct = res.data;
        setProduct(boughtProduct);

        // 2. Log purchase transaction for ML engine
        interactionApi.logInteraction({
          userId: user?.id,
          productId: boughtProduct.externalId || productId,
          type: 'purchase'
        });

        // 3. Fetch category recommendations
        if (boughtProduct.category) {
          const simRes = await productApi.getProducts(boughtProduct.category, 1, 5);
          const filtered = simRes.data.products.filter((p: any) => p.externalId.toString() !== productId.toString());
          setSimilarProducts(filtered.slice(0, 4));
        }

      } catch (err) {
        console.error('Error processing order success', err);
      } finally {
        setLoading(false);
      }
    };
    
    processOrderSuccess();
  }, [productId, user?.id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">

        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">

        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">Order Details Unavailable</h1>
          <button onClick={() => router.push('/')} className="text-blue-600 hover:underline">Continue Shopping</button>
        </div>
      </div>
    );
  }

  // Generate a random order ID
  const orderId = `ORD-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">

      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        
        {/* Order Confirmation Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 md:p-16 shadow-sm border border-slate-100 dark:border-slate-800 text-center max-w-3xl mx-auto mb-16 transition-colors duration-500 animate-in slide-in-from-bottom-8 fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mb-8">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Order Confirmed!
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
            Thank you for shopping with us. Your order <span className="font-bold text-slate-900 dark:text-white">{orderId}</span> has been successfully placed and is being prepared for shipping.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => router.push('/')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95"
            >
              <Home className="h-5 w-5" />
              <span>Continue Shopping</span>
            </button>
            <button 
              onClick={() => router.push('/cart')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-8 py-4 rounded-xl font-bold transition-all"
            >
              <Package className="h-5 w-5" />
              <span>Track Order</span>
            </button>
          </div>
        </div>

        {/* Dynamic Post-Purchase Recommendations */}
        {similarProducts.length > 0 && (
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-4 fade-in delay-300 fill-mode-both">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                People Also Bought In <span className="text-blue-600 capitalize">{product.category}</span>
              </h2>
              <button 
                onClick={() => router.push(`/?q=${product.category}`)}
                className="hidden sm:flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-bold"
              >
                <span>View More</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((simProd, index) => (
                <ProductCard key={`sim-${simProd.externalId}-${index}`} product={simProd} />
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-10 w-10"/></div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}
