import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { auth } from "../config/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Mail, Lock, User, AlertCircle, Eye, EyeOff } from "lucide-react";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    let valid = true;
    setUsernameError("");
    setEmailError("");
    setPasswordError("");
    if (!username) {
      setUsernameError("Username is required.");
      valid = false;
    }
    if (!email) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }
    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    }
    return valid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;
      await updateProfile(firebaseUser, { displayName: username });
      const idToken = await firebaseUser.getIdToken();
      const backendResponse = await axios.post(
        "http://localhost:8000/api/auth/firebase-login",
        {
          idToken: idToken,
          username: username,
        }
      );
      const sanctumToken = backendResponse.data.token;
      localStorage.setItem("sanctum_token", sanctumToken);
      navigate("/dashboard");
    } catch (err) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (err.code) {
        switch (err.code) {
          case "auth/email-already-in-use":
            errorMessage = "This email is already registered.";
            break;
          case "auth/weak-password":
            errorMessage = "Password should be at least 6 characters.";
            break;
          default:
            errorMessage = err.message;
        }
      } else if (err.response?.data?.errors?.username) {
        errorMessage = err.response.data.errors.username[0];
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f3f4f6]">
      {/* Left: Branding & Tagline */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-[#e0e7ef] p-12">
        <div className="space-y-8 flex flex-col items-center">
          <h1 className="text-5xl font-extrabold text-blue-700 tracking-tight">
            TaskBoard
          </h1>
          <p className="text-lg text-gray-700 font-medium text-center max-w-xs">
            Create your account and start managing your tasks and projects
            efficiently.
          </p>
          <ul className="text-gray-600 text-base space-y-2 mt-4">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full inline-block"></span>{" "}
              Simple management
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full inline-block"></span>{" "}
              Project management
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>{" "}
              Visual progress tracking
            </li>
          </ul>
        </div>
      </div>
      {/* Right: Register Card */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-8 md:p-10 relative">
          {/* Spinner Overlay */}
          {isSubmitting && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 rounded-xl"
              style={{ backdropFilter: "blur(2px)" }}
            >
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-10 h-10 text-gray-200 animate-spin fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-4 text-gray-500 text-base font-medium text-center">
                Creating your account...
              </p>
            </div>
          )}
          <div
            className={
              isSubmitting ? "opacity-60 pointer-events-none select-none" : ""
            }
          >
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                Create Account
              </h2>
              <p className="text-sm text-gray-600 text-center mt-1">
                Sign up to start your productivity journey.
              </p>
            </div>
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    id="username"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-base placeholder-gray-400 transition ${
                      usernameError ? "border-red-400" : ""
                    }`}
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                {usernameError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-1 animate-fade-in">
                    <AlertCircle size={16} />
                    <span>{usernameError}</span>
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    id="email"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-base placeholder-gray-400 transition ${
                      emailError ? "border-red-400" : ""
                    }`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {emailError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-1 animate-fade-in">
                    <AlertCircle size={16} />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className={`w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-base placeholder-gray-400 transition ${
                      passwordError ? "border-red-400" : ""
                    }`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-600 focus:outline-none"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-1 animate-fade-in">
                    <AlertCircle size={16} />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm animate-fade-in">
                  <AlertCircle size={18} className="min-w-[18px]" />
                  <span>{error}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                Register
              </button>
              <p className="text-sm text-center text-gray-700">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-700 font-medium hover:underline"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
