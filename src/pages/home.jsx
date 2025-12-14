import React, { useState, useEffect } from "react";
import "./home.css";
import TextType from "./components/TextType.jsx";
import logo from "../assets/logo.png";
import HomeEle from "./sub-pages/homepage.jsx";
import Browse from "./sub-pages/browse.jsx";
import Cart from "./sub-pages/cart.jsx";
import Profile from "./sub-pages/profile.jsx";

import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [screen, setScreen] = useState(0);
  const [role, setRole] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 2000);
    const removeTimer = setTimeout(() => setLoading(false), 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setRole(snap.data().role);
      }
    };
    fetchRole();
  }, [user]);

  const screens = [
    <HomeEle />,
    <Browse />,
    role !== "admin" ? <Cart /> : null,
    <Profile />
  ];

  return (
    <>
      {loading ? (
        <div className={`loader ${fadeOut ? "fade-out" : ""}`}>
          <div className="logo">
            <img src={logo} alt="" className="logo" />
          </div>
          <div className="name">
            <TextType
              text={"Dessert Junction"}
              typingSpeed={100}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter=""
            />
            <TextType
              text={"Sweets."}
              typingSpeed={100}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter=""
            />
          </div>
        </div>
      ) : (
        <div className="holder">
          <div className="navbar">
            <div className="nleft">
              <img src={logo} alt="" className="nlogo" />
              <div className="nmain">
                <div className="nname">Dessert Junction</div>
                <div className="nslogan">Rishton ki meethi shuruaat</div>
              </div>
            </div>

            <div className="nright">
              <div className="nopts" onClick={() => setScreen(0)}>
                Home
              </div>

              {role !== "admin" && (
                <div className="nopts" onClick={() => setScreen(2)}>
                  Cart
                </div>
              )}

              <div className="nopts" onClick={() => setScreen(3)}>
                Profile
              </div>
            </div>
          </div>

          <div className="body">
            {screens[screen]}
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;
