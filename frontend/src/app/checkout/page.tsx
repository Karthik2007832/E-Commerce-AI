'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { productApi, orderApi } from '@/api';
import { useAuthStore } from '@/store';
import { Loader2, ArrowLeft, ShieldCheck, MapPin, CreditCard } from 'lucide-react';

const CheckoutContent = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'card'
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await productApi.getProduct(productId);
        setProduct(res.data);
      } catch (err) {
        console.error('Error fetching checkout product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    setProcessing(true);

    try {
      // Create order via backend which will send an email bill
      const res = await orderApi.createOrder({
        fullName: formData.fullName,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        paymentMethod: formData.paymentMethod,
        totalAmount: product.price * 1.08,
        cart: [{
          id: product.externalId || product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          quantity: 1
        }]
      });

      if (res.data.success) {
        setProcessing(false);
        // Redirect to success page only on success
        router.push(`/order-success?productId=${product.externalId || product.id}`);
      } else {
        throw new Error(res.data.message || 'Failed to create order');
      }
    } catch (err: any) {
      console.error('Failed to create order e-bill', err);
      alert('Failed to place order: ' + (err.response?.data?.message || err.message || 'Server unreachable'));
      setProcessing(false);
    }
  };


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
          <h1 className="text-2xl font-bold">No product selected for checkout</h1>
          <button onClick={() => router.push('/')} className="text-blue-600 hover:underline">Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">

      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <button 
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Product</span>
        </button>

        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight transition-colors">
          Secure Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Forms */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Delivery Address Form */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-full">
                  <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Delivery Address</h2>
              </div>
              
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                    <input required name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="John Doe" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                    <input required name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Street Address</label>
                  <input required name="address" value={formData.address} onChange={handleInputChange} type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="123 Main St, Apt 4B" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
                    <input required name="city" value={formData.city} onChange={handleInputChange} type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="New York" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ZIP / Postal Code</label>
                    <input required name="zipCode" value={formData.zipCode} onChange={handleInputChange} type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="10001" />
                  </div>
                </div>
              </form>
            </div>

            {/* Payment Options */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-full">
                  <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Payment Method</h2>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center p-4 border border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleInputChange} className="h-5 w-5 text-blue-600 focus:ring-blue-500" />
                  <div className="ml-4 flex-1">
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">Credit / Debit Card</span>
                    <span className="block text-sm text-slate-500 dark:text-slate-400">Secure payment via Stripe</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-8 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="w-8 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} className="h-5 w-5 text-blue-600 focus:ring-blue-500" />
                  <div className="ml-4 flex-1">
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">Cash on Delivery</span>
                    <span className="block text-sm text-slate-500 dark:text-slate-400">Pay when your order arrives</span>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 sticky top-12 transition-colors">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 transition-colors">Order Summary</h2>
              
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center p-2 shrink-0">
                  <img src={product.image} alt={product.title} className="max-w-full max-h-full object-contain" onError={(e) => { e.currentTarget.src = 'https://placehold.co/200x200/f8fafc/64748b/png?text=Item' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate" title={product.title}>{product.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">{product.category}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-2">${product.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900 dark:text-white">${product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600 dark:text-green-400">Free</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Estimated Tax</span>
                  <span className="font-medium text-slate-900 dark:text-white">${(product.price * 0.08).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-6 mb-8">
                <span className="text-base font-medium text-slate-900 dark:text-white">Total</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white">${(product.price * 1.08).toFixed(2)}</span>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={processing}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:active:scale-100"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Processing Securely...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-6 w-6" />
                    <span>Place Order</span>
                  </>
                )}
              </button>
              
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                By placing your order, you agree to our privacy notice and conditions of use.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-10 w-10"/></div>}>
      <CheckoutContent />
    </Suspense>
  )
}
