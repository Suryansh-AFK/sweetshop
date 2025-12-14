import React, { useEffect, useState } from "react";
import Login from "./login.jsx";
import { auth } from "./firebase";
import emailVerify from "./assets/email.png";
import HomePage from "./pages/home.jsx";
import './App.css'
import {
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
} from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleResendVerification = async () => {
    if (user && !user.emailVerified && resendCooldown === 0) {
      try {
        await sendEmailVerification(user);
        setMessage("Verification email sent successfully!");
        setResendCooldown(30);
      } catch (error) {
        setMessage("Failed to send verification email. Please try again.");
      }
    }
  };

  // countdown for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // ✅ Loading screen
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Poppins, sans-serif",
          fontSize: "18px",
          color: "#0077b6",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div>
      {user ? (
        user.emailVerified ? (
          <HomePage />
        ) : (
          <div className="all">
            <div className="left">
              <div className="m">
                <div className="head">Verify Your Email</div>
                <div className="details">
                  We’ve sent a verification link to your email address.
                </div>
                <div className="details">
                  Please click the link in the email to verify your account and
                  complete your registration.
                </div>
                <div className="details" className="bold">
                  If you don’t see the email, kindly check your spam or junk
                  folder.
                </div>
                <div className="details">
                  Once verified, please refresh this page or log in again.
                </div>

                <div className="details">
                  <button
                    className="btn"
                    onClick={handleResendVerification}
                    disabled={resendCooldown > 0}
                    style={{
                      opacity: resendCooldown > 0 ? 0.7 : 1,
                      marginTop: "10px",
                    }}
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend Verification Email"}
                  </button>
                </div>
                {message && (
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#0077b6",
                      fontFamily: "Poppins, sans-serif",
                      marginTop: "6px",
                    }}
                  >
                    {message}
                  </div>
                )}
              </div>
            </div>

            {/* <div className="right">
              <img
                src={emailVerify}
                alt="Email verification"
                className="auth-logo"
              />
            </div> */}
          </div>
        )
      ) : (
        <Login onLogin={setUser} />
      )}
    </div>
  );
}

export default App;
