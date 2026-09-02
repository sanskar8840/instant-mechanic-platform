import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home.jsx";

import CustomerLogin from "./pages/CustomerLogin.jsx";
import CustomerRegister from "./pages/CustomerRegister.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import MyVehicles from "./pages/MyVehicles.jsx";
import AddVehicle from "./pages/AddVehicle.jsx";
import Services from "./pages/Services.jsx";
import BookService from "./pages/BookService.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import BookingDetails from "./pages/BookingDetails.jsx";

import MechanicLogin from "./pages/MechanicLogin.jsx";
import MechanicRegister from "./pages/MechanicRegister.jsx";
import MechanicDashboard from "./pages/MechanicDashboard.jsx";

import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminFinance from "./pages/AdminFinance.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/customer/login"
        element={<CustomerLogin />}
      />

      <Route
        path="/customer/register"
        element={<CustomerRegister />}
      />

      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/vehicles"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <MyVehicles />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/vehicles/add"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <AddVehicle />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/services"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <Services />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/book-service/:serviceId"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <BookService />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/bookings"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/bookings/:bookingId"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <BookingDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mechanic/login"
        element={<MechanicLogin />}
      />

      <Route
        path="/mechanic/register"
        element={<MechanicRegister />}
      />

      <Route
        path="/mechanic/dashboard"
        element={
          <ProtectedRoute allowedRoles={["mechanic"]}>
            <MechanicDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/finance"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminFinance />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}