import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";

import {
  FolderIcon,
  PlusIcon,
  LogoutIcon,
  DashboardIcon,
  SearchIcon,
} from "../assets/icons/Icons.jsx";

const Header = ({ userData, onLogout }) => {
  const { search, setSearch } = useSearch();

  return (
    <header className="w-full bg-white shadow-md flex-shrink-0 h-12 border-b border-gray-200 z-10">
      <div className="flex justify-between items-center h-full px-6">
        <h1 className="text-xl font-bold text-gray-800">TaskBoard</h1>
        <div className="relative flex-grow mx-4 max-w-lg justify-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-gray-300"></div>
          {userData ? (
            <span className="text-sm font-medium text-gray-700">
              Hi, {userData.username}
            </span>
          ) : (
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          )}
          <button onClick={onLogout} title="Logout">
            <LogoutIcon className="size-5 text-red-500 hover:text-red-700" />
          </button>
        </div>
      </div>
    </header>
  );
};

const Sidebar = () => {
  const location = useLocation();
  return (
    <aside className="w-64 bg-white shadow-md flex-shrink-0 border-r border-gray-200 p-4">
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 mb-6">
        <PlusIcon className="size-5" />
        <span>Add New</span>
      </button>
      <nav className="space-y-2">
        <Link
          to="/dashboard"
          className={`flex items-center space-x-3 p-2 rounded-lg font-semibold ${
            location.pathname.startsWith("/dashboard")
              ? "bg-blue-100 text-blue-800"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <DashboardIcon className="size-5" />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/projects"
          className={`flex items-center space-x-3 p-2 rounded-lg font-semibold ${
            location.pathname.startsWith("/projects")
              ? "bg-blue-100 text-blue-800"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <FolderIcon className="size-5" />
          <span>Projects</span>
        </Link>
      </nav>
    </aside>
  );
};

const MainLayout = ({ children }) => {
  const { isAuthenticated, handleLogout, loadingAuth } = useAuth();
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      navigate("/login");
    }

    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const authToken = localStorage.getItem("sanctum_token");
          if (!authToken) {
            handleLogout();
            return;
          }
          const response = await axios.get("http://localhost:8000/api/user", {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          setUserData(response.data);
        } catch (error) {
          console.error("Failed to fetch user data in layout", error);
          if (error.response?.status === 401) {
            handleLogout();
          }
        }
      }
    };

    if (!loadingAuth) {
      fetchUserData();
    }
  }, [isAuthenticated, loadingAuth, navigate, handleLogout]);

  if (loadingAuth) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-inter">
      <Header userData={userData} onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
