import React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../utils/auth";

export default function PrivateRoute({ children, redirectTo = "/login-user" }) {
  const token = getToken();

  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
