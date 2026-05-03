import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Pill, Plus } from "lucide-react";

export default function BuyMedicines() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    setFiltered(
      search.trim() === ""
        ? medicines
        : medicines.filter((m) =>
            m.name.toLowerCase().includes(search.toLowerCase()),
          ),
    );
  }, [search, medicines]);

  const fetchMedicines = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/medicines");
      setMedicines(res.data);
      setFiltered(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (medicineId: string) => {
    const selectedMedicine = filtered.find((med) => med._id === medicineId);
    if (!selectedMedicine) return;
    setCart((prev) => [
      ...prev,
      {
        ...selectedMedicine,
        needsPrescription: selectedMedicine.requiresPrescription,
      },
    ]);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const requiresPrescription = cart.some((item) => item.needsPrescription);

    if (requiresPrescription && !prescriptionFile) {
      alert("Please upload prescription to continue.");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("items", JSON.stringify(cart));
      formData.append(
        "totalAmount",
        cart.reduce((sum, item) => sum + item.price, 0).toString(),
      );

      if (prescriptionFile) {
        formData.append("prescription", prescriptionFile);
      }

      const response = await axios.post(
        "http://localhost:5000/api/orders/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        alert("Order placed successfully!");
        setCart([]);
      }
    } catch (error) {
      console.error(error);
      alert("Order failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Button */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>

        {/* Title + Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Pill className="w-8 h-8 text-[#10B981]" /> Buy Medicines
            </h1>
            <p className="text-slate-500 mt-1">
              Order medicines easily from trusted sources
            </p>
          </div>

          <div className="relative w-full md:w-auto min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#10B981] shadow-sm"
            />
          </div>
        </div>

        {/* Medicines Grid */}
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((med) => (
              <div
                key={med._id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex-grow">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                    <Pill className="w-6 h-6 text-[#10B981]" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-800">
                    {med.name}
                  </h3>

                  {med.brand && (
                    <p className="text-sm text-slate-500">{med.brand}</p>
                  )}

                  <p className="text-sm text-slate-500">{med.type}</p>

                  {med.requiresPrescription && (
                    <p className="text-xs text-red-500 mt-1">
                      Prescription Required
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xl font-bold text-slate-800">
                    ₹{med.price}
                  </span>
                  <button
                    onClick={() => handleAddToCart(med._id)}
                    className="flex items-center gap-1 bg-[#10B981] text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                No medicines found.
              </div>
            )}
          </div>
        )}

        {/* Cart Section */}
        <div className="mt-10 p-6 bg-white rounded-2xl shadow border">
          <h2 className="text-xl font-bold mb-4">Cart Items 🛒</h2>

          {cart.length === 0 ? (
            <p className="text-slate-500">No items in cart</p>
          ) : (
            <div>
              {cart.map((item, index) => (
                <div key={index} className="border-b py-2">
                  <div className="flex justify-between">
                    <span>{item.name}</span>
                    <span>₹{item.price}</span>
                  </div>
                  {item.needsPrescription && (
                    <p className="text-red-500 text-xs">
                      Prescription required before checkout
                    </p>
                  )}
                </div>
              ))}

              <div className="mt-4 font-semibold text-right">
                Total: ₹{cart.reduce((sum, item) => sum + item.price, 0)}
              </div>

              {cart.some((item) => item.needsPrescription) && (
                <div className="mt-4">
                  <p className="text-sm font-medium">Upload Prescription</p>

                  <input
                    type="file"
                    onChange={(e) =>
                      setPrescriptionFile(e.target.files?.[0] || null)
                    }
                    className="border p-2 w-full mt-1"
                  />
                </div>
              )}

              <button
                onClick={handleCheckout}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
