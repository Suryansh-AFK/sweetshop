import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  arrayUnion,
  Timestamp
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase.js";
import "./subpages.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const fetchCart = async () => {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      setCartItems(snap.data()?.cart || []);
    };

    fetchCart();
  }, [user]);

  const placeOrder = async () => {
    if (!user || cartItems.length === 0) return;

    try {
      let totalAmount = 0;

      for (let item of cartItems) {
        const itemRef = doc(db, "items", item.id);
        const itemSnap = await getDoc(itemRef);

        if (!itemSnap.exists()) {
          alert(`${item.name} does not exist`);
          return;
        }

        const stock = itemSnap.data().quantity;

        if (stock < 1) {
          alert(`${item.name} is out of stock`);
          return;
        }

        await updateDoc(itemRef, {
          quantity: stock - 1
        });

        totalAmount += item.price;
      }

      const orderCode = Math.floor(1000 + Math.random() * 9000);

      const orderData = {
        userId: user.uid,
        items: cartItems,
        totalAmount,
        delivered: false,
        orderCode,
        createdAt: Timestamp.now()
      };

      // Global orders collection
      await addDoc(collection(db, "orders"), orderData);

      // User orders history
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        cart: [],
        orders: arrayUnion(orderData)
      });

      setCartItems([]);
      alert(`Order placed successfully 🎉\nOrder Code: ${orderCode}`);

    } catch (err) {
      console.error(err);
      alert("Something went wrong while placing order");
    }
  };

  if (!cartItems.length) {
    return <div className="noitem">Your cart is empty</div>;
  }

  return (
    <div className="all">
      <h2 className="tag">Your Cart</h2>

      <div className="items-grid">
        {cartItems.map(item => (
          <div className="item-card" key={item.id}>
            <img src={item.img} alt={item.name} className="mithai" />
            <div className="itemname">{item.name}</div>
            <div className="price">
              ₹{item.price} <span>{item.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div>
        <button className="cart-btn added" onClick={placeOrder}>
          Place Order
        </button>
      </div>
    </div>
  );
};

export default Cart;
