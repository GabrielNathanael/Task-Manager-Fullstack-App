import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      const username = user.displayName || user.email.split("@")[0];

      const backendResponse = await axios.post(
        "http://localhost:8000/api/auth/firebase-login",
        { idToken: idToken, username: username }
      );

      const sanctumToken = backendResponse.data.token;
      localStorage.setItem("sanctum_token", sanctumToken);

      if (backendResponse.status === 200) {
        navigate("/dashboard");
      } else {
        setError(
          backendResponse.data.message ||
            "Gagal mengautentikasi dengan backend."
        );
      }
    } catch (err) {
      let errorMessage =
        "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.";
      if (err.code) {
        switch (err.code) {
          case "auth/invalid-credential":
          case "auth/wrong-password":
          case "auth/user-not-found":
          case "auth/invalid-email":
            errorMessage = "Email atau password salah.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Terlalu banyak percobaan login. Coba lagi nanti.";
            break;
          case "auth/network-request-failed":
            errorMessage =
              "Masalah jaringan. Pastikan Anda terhubung ke internet.";
            break;
          default:
            errorMessage = err.message;
        }
      } else if (
        err.response &&
        err.response.data &&
        err.response.data.errors
      ) {
        const validationErrors = Object.values(err.response.data.errors)
          .flat()
          .join("; ");
        errorMessage = `Validation failed: ${validationErrors}`;
      } else if (
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            >
              Don't have an account? Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
