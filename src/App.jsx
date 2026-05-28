import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Admin Pages
import AdminLogin from "../frontend/pages/admin/adminlogin";
import AdminDashboard from "../frontend/pages/admin/admindashboard";

// Master Pages
import ManageFood from "../frontend/pages/admin/master/managefood";
import ManageCategory from "../frontend/pages/admin/master/managecategory";
import ManageVariety from "../frontend/pages/admin/master/managevariety";

// Report Pages
import BillWiseCollectionSummary from "../frontend/pages/admin/reports/billwisecollectionsummary";
import DateWiseCollectionSummary from "../frontend/pages/admin/reports/datewisecollectionsummary";
import DayBook from "../frontend/pages/admin/reports/daybook";
import FoodWiseCollectionSummary from "../frontend/pages/admin/reports/foodwisecollectionsummary";

// Protected Route
import ProtectedRoute from "../frontend/components/protectedroutes";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>

        {/* Login */}
        <Route path="/" element={<AdminLogin />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>

          {/* Dashboard */}
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          {/* Master */}
          <Route
            path="/admin/manage-food"
            element={<ManageFood />}
          />

          <Route
            path="/admin/manage-category"
            element={<ManageCategory />}
          />

          <Route
            path="/admin/manage-variety"
            element={<ManageVariety />}
          />

          {/* Reports */}
          <Route
            path="/admin/reports/billwise-collection"
            element={<BillWiseCollectionSummary />}
          />

          <Route
            path="/admin/reports/datewise-collection"
            element={<DateWiseCollectionSummary />}
          />

          <Route
            path="/admin/reports/daybook"
            element={<DayBook />}
          />

          <Route
            path="/admin/reports/foodwise-collection"
            element={<FoodWiseCollectionSummary />}
          />

        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <h1 style={{ textAlign: "center", marginTop: "50px" }}>
              404 - Page Not Found
            </h1>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}