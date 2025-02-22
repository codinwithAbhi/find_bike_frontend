import React, { useEffect, useState, useContext } from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import Login from "../pages/Login"; // Single login page for both users
import Registration from "../pages/Registration";
import GarageRegistration from "../pages/GarageRegistration";
import Home from "../pages/Home";
import { DataContext } from "../components/contexts";
import GarageDashboard from "../pages/GarageDashboard";

const MapperRouter = () => {
    const { auth } = useContext(DataContext);
    const [authCheck, setAuthCheck] = useState(false);

    useEffect(() => {
        if (auth) setAuthCheck(true);
    }, [auth]);

    const RequireAuth = () => {
        if (!authCheck) return <Navigate to={basePath + "/login"} replace />;
        return <Outlet />;
    };

    // Get module type from environment variable
    const moduleType = process.env.REACT_APP_MODULE;

    // Set base path dynamically based on module type
    const basePath = moduleType === "garageuser" ? "/garage" : "/user";

    return (
        <div className="wrapper">
            <Routes>
                {/* Single Login Page for Both Modules (Uses Prefixed URL) */}
                <Route path={`${basePath}/login`} element={<Login />} />

                {/* User Module Routes (Prefixed with /user) */}
                {moduleType === "user" && (
                    <>
                        <Route path={`${basePath}/registration`} element={<Registration />} />
                        <Route path={basePath} element={<RequireAuth />}>
                            <Route path={`${basePath}/home`} element={<Home />} />
                        </Route>
                    </>
                )}

                {/* Garage User Module Routes (Prefixed with /garage) */}
                {moduleType === "garageuser" && (
                    <>
                        <Route path={`${basePath}/garage_registration`} element={<GarageRegistration />} />
                        <Route path={basePath} element={<RequireAuth />}>
                            <Route path={`${basePath}/home`} element={<GarageDashboard />} />
                        </Route>
                    </>
                )}

                {/* Redirect to login if no matching routes */}
                <Route path="*" element={<Navigate to={`${basePath}/login`} replace />} />
            </Routes>
        </div>
    );
};

export default MapperRouter;
