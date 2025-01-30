import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import NavBar from "./components/NavBar";
import ProductCatalog from "./components/ProductCatalog";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import "bootstrap/dist/css/bootstrap.min.css";
import ProductCatalogEmployee from "./components/ProductCatalogEmployee";
import ManageOrders from "./components/ManageOrders";
import ImportDatabase from "./components/ImportDatabase";
import UserOrders from "./components/UserOrders";
import { ToastContainer } from "react-toastify";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Cart from "./components/Cart";

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <div>
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route
              path="/products"
              element={
                <PrivateRoute requiredRole={["CLIENT"]}>
                  <ProductCatalog />
                </PrivateRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <PrivateRoute requiredRole={["CLIENT"]}>
                  <Cart />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute requiredRole={["CLIENT"]}>
                  <UserOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/products"
              element={
                <PrivateRoute requiredRole={["EMPLOYEE"]}>
                  <ProductCatalogEmployee />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/orders"
              element={
                <PrivateRoute requiredRole={["EMPLOYEE"]}>
                  <ManageOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/import-products"
              element={
                <PrivateRoute requiredRole={["EMPLOYEE"]}>
                  <ImportDatabase />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
