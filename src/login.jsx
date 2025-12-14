import './App.css';
import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import authLogo from "./assets/authimage.png";
import { PulseLoader } from "react-spinners";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [register, setRegister] = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  // Monitor email verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          await updateDoc(doc(db, "users", user.uid), {
            emailVerified: true
          });
          localStorage.setItem("user", JSON.stringify(user));
          onLogin(user);
        }
      }
    });
    return () => unsubscribe();
  }, [onLogin]);

  // Login
  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("Please verify your email before logging in.");
        await auth.signOut();
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Register
  const handleRegister = async () => {
    if (!email || !password || !gender || !dob || !username || !role) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid), {
        username,
        email: user.email,
        gender,
        dob,
        role, 
        createdAt: new Date().toISOString(),
        emailVerified: false,
      });

      setShowVerify(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      register ? handleRegister() : handleLogin();
    }
  };

  // Verification Screen
  if (showVerify) {
    return (
      <div className="main">
        <div className="left">
          <div className="early">
            <div className="body">
              <div className="greet">Verify Your Email</div>
              <div className="desc">
                We’ve sent a verification link to <b>{email}</b>.<br />
                Please verify your email to continue.
              </div>
              <div className="btn" onClick={() => window.location.reload()}>
                Refresh After Verification
              </div>
            </div>
          </div>
        </div>
        <div className="right">
          <img src={authLogo} className="auth-logo" />
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      <div className="left">
        <div className="early">
          <div className="body">
            <div className="greet">
              {register ? "Create Account" : "Welcome Back"}
            </div>

            <input
              className="inputs"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
            />

            {register && (
              <input
                className="inputs"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            )}

            <input
              type="password"
              className="inputs"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
            />

            {register && (
              <>
                <select
                  className="inputs"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>

                <input
                  type="date"
                  className="inputs"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />

                
                <select
                  className="inputs"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </>
            )}

            {error && <div className="error">{error}</div>}

            <div className="btn" onClick={register ? handleRegister : handleLogin}>
              {loading ? (
                <PulseLoader color="#fff" size={8} />
              ) : register ? "Register" : "Login"}
            </div>

            <div className="info">
              {register ? (
                <>Already have an account? <span className="reg" onClick={() => setRegister(false)}>Login</span></>
              ) : (
                <>Don't have an account? <span className="reg" onClick={() => setRegister(true)}>Register</span></>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="right">
        <img src={authLogo} className="auth-logo" />
      </div>
    </div>
  );
}

export default Login;
