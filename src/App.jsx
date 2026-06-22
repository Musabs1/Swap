import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [listings, setListings] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    location: "",
    category: "Electronics",
    description: "",
  });

  useEffect(() => {
    async function fetchListings() {
      const response = await fetch("http://localhost:5000/api/listings");
      const data = await response.json();
      setListings(data);
    }

    fetchListings();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const response = await fetch("http://localhost:5000/api/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const newListing = await response.json();

    setListings([newListing, ...listings]);

    setFormData({
      title: "",
      price: "",
      location: "",
      category: "Electronics",
      description: "",
    });
  }

  return (
    <>
      <nav className="navbar">
        <div className="logo">Swap</div>
      </nav>

      <section className="hero">
        <h1>Buy, sell, and swap locally.</h1>
        <p>Create real listings and browse items posted on Swap.</p>
      </section>

      <main className="container">
        <h2>Create a Listing</h2>

        <form onSubmit={handleSubmit} className="listing-form">
          <input
            name="title"
            placeholder="Item title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <input
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
          />

          <input
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            required
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option>Electronics</option>
            <option>Furniture</option>
            <option>Vehicles</option>
            <option>Clothing</option>
            <option>Home Goods</option>
          </select>

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <button type="submit">Post Listing</button>
        </form>

        <h2>Listings</h2>

        {listings.length === 0 ? (
          <p>No listings yet. Create the first one.</p>
        ) : (
          <div className="listing-grid">
            {listings.map((item) => (
              <div className="card" key={item.id}>
                <div className="image-placeholder">{item.category}</div>
                <div className="card-content">
                  <div className="price">{item.price}</div>
                  <h3>{item.title}</h3>
                  <p className="location">{item.location}</p>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default App;