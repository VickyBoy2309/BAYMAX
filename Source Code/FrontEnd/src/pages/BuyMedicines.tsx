import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, Search, Pill, Plus } from "lucide-react";

export default function BuyMedicines() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFiltered(medicines);
    } else {
      const filteredData = medicines.filter((med) =>
        med.name.toLowerCase().includes(search.toLowerCase())
      );
      setFiltered(filteredData);
    }
  }, [search, medicines]);

const fetchMedicines = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/medicines");
    console.log("DIRECT FETCH DATA:", res.data);
    setMedicines(res.data);
    setFiltered(res.data);
  } catch (error) {
    console.error("DIRECT FETCH ERROR:", error);
  } finally {
    setLoading(false);
  }
};
  const handleAddToCart = (medicineId: string) => {
    alert("Cart system not implemented yet.");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
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
      </div>
    </div>
  );
}