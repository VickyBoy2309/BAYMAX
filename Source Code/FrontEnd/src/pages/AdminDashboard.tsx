import React, { useEffect, useState } from "react";
import axios from "axios";

interface Doctor {
  _id: string;
  name: string;
  email: string;
}

interface OrderItem {
  name: string;
  price: number;
  needsPrescription: boolean;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  prescriptionPath?: string;
}

const AdminDashboard = () => {
const [pendingDoctors, setPendingDoctors] = useState<Doctor[]>([]);
const [orders, setOrders] = useState<Order[]>([]);

  // 🔹 Fetch Pending Doctors
  const fetchPendingDoctors = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/pending-doctors",
      );
      setPendingDoctors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Fetch Orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/orders");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPendingDoctors();
    fetchOrders();
  }, []);

  // 🔹 Approve Doctor
  const approveDoctor = async (id: string) => {
    await axios.put(`http://localhost:5000/api/admin/approve-doctor/${id}`);
    fetchPendingDoctors();
  };

  // 🔹 Reject Doctor
  const rejectDoctor = async (id: string) => {
    await axios.delete(`http://localhost:5000/api/admin/reject-doctor/${id}`);
    fetchPendingDoctors();
  };

  // 🔹 Approve Order
  const approveOrder = async (id: string) => {
    await axios.put(`http://localhost:5000/api/admin/orders/${id}/approve`);
    fetchOrders();
  };

  // 🔹 Reject Order
  const rejectOrder = async (id: string) => {
    await axios.put(`http://localhost:5000/api/admin/orders/${id}/reject`);
    fetchOrders();
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* 🔹 EXISTING UI (UNCHANGED) */}
      <h2>Pending Doctor Approvals</h2>

      {pendingDoctors.length === 0 ? (
        <div
          style={{
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          No pending doctors awaiting approval.
        </div>
      ) : (
        pendingDoctors.map((doc) => (
          <div
            key={doc._id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "10px",
              marginTop: "15px",
            }}
          >
            <p>
              <b>Name:</b> {doc.name}
            </p>
            <p>
              <b>Email:</b> {doc.email}
            </p>

            <button onClick={() => approveDoctor(doc._id)}>Approve</button>

            <button
              onClick={() => rejectDoctor(doc._id)}
              style={{ marginLeft: "10px" }}
            >
              Reject
            </button>
          </div>
        ))
      )}

      {/* 🆕 NEW FEATURE ADDED BELOW (NO CHANGE ABOVE) */}

      <h2 style={{ marginTop: "40px" }}>📦 Order Approvals</h2>

      {orders.length === 0 ? (
        <div
          style={{
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          No orders available.
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "10px",
              marginTop: "15px",
            }}
          >
            <p>
              <b>Status:</b> {order.status}
            </p>
            <p>
              <b>Total:</b> ₹{order.totalAmount}
            </p>

            <p>
              <b>Medicines:</b>
            </p>
            <ul>
              {order.items.map((item, i) => (
                <li key={i}>
                  {item.name} - ₹{item.price}
                  {item.needsPrescription && " (Prescription Required)"}
                </li>
              ))}
            </ul>

            {order.prescriptionPath && (
              <a
                href={`http://localhost:5000/${order.prescriptionPath}`}
                target="_blank"
                rel="noreferrer"
              >
                View Prescription
              </a>
            )}

            {order.status === "PENDING" && (
              <div style={{ marginTop: "10px" }}>
                <button onClick={() => approveOrder(order._id)}>Approve</button>

                <button
                  onClick={() => rejectOrder(order._id)}
                  style={{ marginLeft: "10px" }}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDashboard;
