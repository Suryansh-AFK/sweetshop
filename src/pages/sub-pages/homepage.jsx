import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  getDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase.js";
import "./subpages.css";

const HomeEle = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({});
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    unit: "kg",
    img: "",
    category: "",
    quantity: ""
  });

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchItems = async () => {
      const snap = await getDocs(collection(db, "items"));
      setItems(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    };

    const fetchRole = async () => {
      if (!user) return;
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists()) {
        setRole(userSnap.data().role);
      }
    };

    fetchItems();
    fetchRole();
  }, [user]);

  const toggleCart = async (item) => {
    if (!user || role === "admin") return;

    const userRef = doc(db, "users", user.uid);
    const payload = {
      id: item.id,
      name: item.name,
      price: item.price,
      img: item.img,
      unit: item.unit
    };

    setCart(prev => {
      const copy = { ...prev };

      if (copy[item.id]) {
        updateDoc(userRef, { cart: arrayRemove(payload) });
        delete copy[item.id];
      } else {
        updateDoc(userRef, { cart: arrayUnion(payload) });
        copy[item.id] = item;
      }

      return copy;
    });
  };

  const handleAddItem = async () => {
    const { name, description, price, img, unit, category, quantity } = newItem;

    if (!name || !price || !quantity) {
      alert("Fill all required fields");
      return;
    }

    await addDoc(collection(db, "items"), {
      name,
      description,
      price: Number(price),
      unit,
      img,
      category,
      quantity: Number(quantity),
      createdAt: new Date()
    });

    alert("Sweet added successfully");

    setNewItem({
      name: "",
      description: "",
      price: "",
      unit: "kg",
      img: "",
      category: "",
      quantity: ""
    });

    setShowAddForm(false);

    const snap = await getDocs(collection(db, "items"));
    setItems(
      snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    );
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="all">
      {role !== "admin" && <div className="tag">Today's Menu</div>}

      {role === "admin" && (
        <div className="admin-panel">
          <button
            className="cart-btn"
            onClick={() => setShowAddForm(prev => !prev)}
          >
            {showAddForm ? "Cancel" : "Add New Sweet"}
          </button>

          {showAddForm && (
            <div className="admin-form">
              <input
                className="inputs"
                placeholder="Name"
                value={newItem.name}
                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
              />
              <input
                className="inputs"
                placeholder="Description"
                value={newItem.description}
                onChange={e =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
              />
              <input
                className="inputs"
                placeholder="Image URL"
                value={newItem.img}
                onChange={e => setNewItem({ ...newItem, img: e.target.value })}
              />
              <input
                className="inputs"
                placeholder="Category"
                value={newItem.category}
                onChange={e =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
              />
              <input
                className="inputs"
                type="number"
                placeholder="Price"
                value={newItem.price}
                onChange={e =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
              />
              <input
                className="inputs"
                type="number"
                placeholder="Stock Quantity"
                value={newItem.quantity}
                onChange={e =>
                  setNewItem({ ...newItem, quantity: e.target.value })
                }
              />

              <button className="cart-btn added" onClick={handleAddItem}>
                Save Sweet
              </button>
            </div>
          )}
        </div>
      )}

      {role !== "admin" && (
        <input
          className="search"
          placeholder="Search sweets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      )}

      <div className="items-grid">
        {filteredItems.map(item => {
          const inCart = !!cart[item.id];

          return (
            <div className="item-card" key={item.id}>
              <img src={item.img} alt={item.name} className="mithai" />
              <div className="itemname">{item.name}</div>
              <div className="detail">{item.description}</div>
              <div className="price">
                ₹{item.price} <span>{item.unit}</span>
              </div>

              {role !== "admin" && (
                <button
                  className={`cart-btn ${inCart ? "added" : ""}`}
                  onClick={() => toggleCart(item)}
                >
                  {inCart ? "Added to Cart" : "Add to Cart"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomeEle;
