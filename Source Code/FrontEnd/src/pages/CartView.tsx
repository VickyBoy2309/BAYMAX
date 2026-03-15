import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, ShoppingCart, Trash2, ShieldCheck, Pill } from 'lucide-react';

export default function CartView() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get('/patients/cart');
      setCart(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (medicineId: string) => {
    try {
      const res = await api.delete(`/patients/cart/${medicineId}`);
      setCart(res.data);
    } catch (error) {
      console.error(error);
      alert('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    try {
      await api.post('/patients/cart/checkout');
      alert('Order Placed Successfully!');
      setCart({ ...cart, items: [] });
      navigate('/medicines');
    } catch (error) {
      console.error(error);
      alert('Checkout Failed');
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total: number, item: any) => {
      return total + (item.medicine.price * item.quantity);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <button 
          onClick={() => navigate('/medicines')} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Medicines
        </button>

        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-[#00A99D]" /> Your Cart
          </h1>
          <p className="text-slate-500 mt-1">Review your medicines before checkout</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A99D]"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {cart?.items?.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {cart.items.map((item: any, idx: number) => (
                  <div key={idx} className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                        <Pill className="w-8 h-8 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{item.medicine.name}</h3>
                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between w-full md:w-auto gap-8">
                      <span className="text-xl font-bold text-slate-800">
                        ₹{item.medicine.price * item.quantity}
                      </span>
                      <button 
                        onClick={() => handleRemove(item.medicine._id)}
                        className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="p-6 bg-slate-50 flex flex-col items-end">
                  <div className="text-right space-y-2 mb-6">
                    <div className="text-slate-500 flex justify-between gap-12">
                      <span>Subtotal</span>
                      <span className="font-semibold">₹{calculateTotal()}</span>
                    </div>
                    <div className="text-slate-500 flex justify-between gap-12">
                      <span>Delivery</span>
                      <span className="font-semibold text-emerald-500">Free</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 flex justify-between gap-12 pt-4 border-t border-slate-200">
                      <span>Total</span>
                      <span>₹{calculateTotal()}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleCheckout}
                    className="flex items-center gap-2 bg-[#00A99D] text-white px-8 py-4 rounded-xl hover:bg-teal-600 transition-colors shadow-lg font-bold text-lg w-full md:w-auto"
                  >
                    <ShieldCheck className="w-6 h-6" /> Place Order
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 px-4">
                <ShoppingCart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Your cart is empty</h3>
                <p className="text-slate-500 mb-6">Looks like you haven't added any medicines yet.</p>
                <button 
                  onClick={() => navigate('/medicines')}
                  className="bg-[#00A99D] text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-600 transition-colors inline-flex items-center gap-2"
                >
                  <Pill className="w-5 h-5" /> Browse Medicines
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
