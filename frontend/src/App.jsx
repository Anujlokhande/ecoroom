import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateRoom from "./pages/CreateRoom";
import MainLayout from "./components/layout/MainLayout";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

const App = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/chat" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/chat" replace /> : <Register />} />
      <Route
        path="/create-room"
        element={user ? <CreateRoom /> : <Navigate to="/login" />}
      />
      <Route
        path="/chat"
        element={user ? <MainLayout /> : <Navigate to="/login" />}
      />
      {/* Redirect root (/) to login by default. 
            Once you have real auth, you'd check a token here and redirect to /chat if logged in. */}

      {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}

      {/* Catch-all 404 route - redirects back to login */}

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
