import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AdminLogin from '../frontend/pages/admin/adminlogin'
import AdminDashboard from '../frontend/pages/admin/admindashboard'
import ManageFood from '../frontend/pages/admin/managefood'
import ManageCategory from '../frontend/pages/admin/managecategory'
import ManageVariety from '../frontend/pages/admin/managevariety'
import ProtectedRoute from "../frontend/components/protectedroutes";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<AdminLogin />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/manage-food" element={<ManageFood />} />
          <Route path="/admin/manage-category" element={<ManageCategory />} />
          <Route path="/admin/manage-variety" element={<ManageVariety />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}