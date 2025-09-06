import React, { useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import AdminDashboard from "../pages/AdminDashboard";
import UserDashboard from "../pages/UserDashboard";

const DashboardRouter = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div>Loading...</div>;
  }

  return user.role === "admin" ? <AdminDashboard /> : <UserDashboard />;
};

export default DashboardRouter;