import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrivateRouteProps {
    children: JSX.Element,
    requiredRole?: string[],
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
    const { isLoggedIn, role, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && !requiredRole.includes(role || "")) {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;
