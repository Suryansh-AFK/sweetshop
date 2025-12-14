import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../../firebase";
import "./subpages.css";

const Profile = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [pins, setPins] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;

        const currentUserData = userSnap.data();
        setUserData(currentUserData);

        let orderSnap;

        if (currentUserData.role === "admin") {
          orderSnap = await getDocs(collection(db, "orders"));
        } else {
          const q = query(
            collection(db, "orders"),
            where("userId", "==", user.uid)
          );
          orderSnap = await getDocs(q);
        }

        const fetchedOrders = orderSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setOrders(fetchedOrders);

        if (currentUserData.role === "admin") {
          const usersSnap = await getDocs(collection(db, "users"));
          const map = {};
          usersSnap.forEach(d => {
            map[d.id] = d.data().username;
          });
          setUserMap(map);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const timeAgo = (timestamp) => {
    if (!timestamp) return "";
    const now = Date.now();
    const past = timestamp.toDate().getTime();
    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return `${Math.floor(diff / 604800)} weeks ago`;
  };

  const handleDeliver = async (order) => {
    const enteredPin = pins[order.id];

    if (!enteredPin) {
      alert("Please enter the 4-digit code");
      return;
    }

    if (String(enteredPin) !== String(order.orderCode)) {
      alert("Invalid delivery code");
      return;
    }

    try {
      await updateDoc(doc(db, "orders", order.id), {
        delivered: true
      });

      setOrders(prev =>
        prev.map(o =>
          o.id === order.id ? { ...o, delivered: true } : o
        )
      );

      alert("Order marked as delivered");
    } catch (err) {
      console.error(err);
      alert("Failed to update order");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    window.location.reload();
  };

  if (loading) {
    return <div className="noitem">Loading profile...</div>;
  }

  return (
    <div className="all">
      <div className="profile-header">
        <h2 className="ttl">
          {userData?.role === "admin" ? "Admin Panel" : "My Profile"}
        </h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {userData && (
        <div className="profile-card">
          <div className="list"><strong>Name:</strong> {userData.username}</div>
          <div className="list"><strong>Email:</strong> {userData.email}</div>
          <div className="list"><strong>Role:</strong> {userData.role}</div>
        </div>
      )}

      <h2 className="ttl">
        {userData?.role === "admin" ? "All Orders" : "Order History"}
      </h2>

      {orders.length === 0 ? (
        <div className="noitem">No orders found</div>
      ) : (
        <div className="orders">
          {orders.map(order => (
            <div className="order-card" key={order.id}>
              <div className="order-head">
                <div className={`status ${order.delivered ? "done" : "pending"}`}>
                  {order.delivered ? "Delivered" : "Undelivered"}
                </div>
              </div>

              <div className="order-date">
                Ordered {timeAgo(order.createdAt)}
              </div>

              {userData?.role === "admin" && (
                <div className="order-user">
                  <strong>Ordered By:</strong> {userMap[order.userId]}
                </div>
              )}

              <div className="order-items">
                {order.items.map((item, i) => (
                  <div className="order-item" key={i}>
                    <img src={item.img} alt={item.name} className="order-img" />
                    <div className="order-info">
                      <div className="order-item-name">{item.name}</div>
                      <div className="order-item-price">
                        ₹{item.price} {item.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {userData?.role === "admin" && !order.delivered && (
                <div className="deliver-box">
                  <input
                    className="inputs"
                    placeholder="Enter 4-digit code"
                    value={pins[order.id] || ""}
                    onChange={e =>
                      setPins({ ...pins, [order.id]: e.target.value })
                    }
                  />
                  <button
                    className="cart-btn added"
                    onClick={() => handleDeliver(order)}
                  >
                    Mark as Delivered
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
