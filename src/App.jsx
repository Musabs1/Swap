import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    location: "",
    category: "Electronics",
    description: "",
  });

  const categories = ["All", "Electronics", "Furniture", "Vehicles", "Clothing", "Home Goods", "Other"];

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

  const filteredListings = listings.filter((item) => {
    const matchesSearch = `${item.title} ${item.category} ${item.location} ${item.description}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory = activeCategory === "All" || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app">
      <div className="shell">
        <nav className="navbar">
          <div className="brand">
            <div className="logo-mark">S</div>
            <span>Swap</span>
          </div>

          <div className="nav-links">
            <span>Home</span>
            <span>Browse</span>
            <span>Categories</span>
          </div>

          <div className="nav-actions">
            <button className="ghost-button">Sign In</button>
            <button className="primary-button">Post Listing</button>
          </div>
        </nav>

        <section className="hero">
          <div>
            <h1>
              Trade. Save.
              <br />
              <span className="blue-text">Sustain.</span>
            </h1>

            <p className="hero-text">
              A clean, modern marketplace for buying, selling, and swapping items in your community.
            </p>

            <div className="search-card">
              <div className="search-icon">⌕</div>
              <input
                placeholder="Search for anything..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="hero-visual">
            <div className="floating-card large">
              <div className="preview-image">🎧</div>
              <div className="preview-body">
                <p className="preview-title">AirPods Pro</p>
                <p className="preview-price">$120</p>
              </div>
            </div>

            <div className="floating-card medium">
              <div className="preview-image">🪑</div>
              <div className="preview-body">
                <p className="preview-title">Lounge Chair</p>
                <p className="preview-price">$60</p>
              </div>
            </div>

            <div className="floating-card small">
              <div className="preview-image">🚲</div>
              <div className="preview-body">
                <p className="preview-title">Fixie Bike</p>
                <p className="preview-price">$200</p>
              </div>
            </div>
          </div>
        </section>

        <div className="category-row">
          {categories.map((category) => (
            <button
              key={category}
              className={activeCategory === category ? "category-pill active" : "category-pill"}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <main className="main-layout">
          <section className="panel">
            <h2>Create a Listing</h2>
            <p className="section-subtitle">Post an item in seconds.</p>

            <form onSubmit={handleSubmit} className="listing-form">
              <input name="title" placeholder="Item title" value={formData.title} onChange={handleChange} required />
              <input name="price" placeholder="Price, e.g. $500" value={formData.price} onChange={handleChange} required />
              <input name="location" placeholder="Location, e.g. Hayward, CA" value={formData.location} onChange={handleChange} required />

              <select name="category" value={formData.category} onChange={handleChange}>
                <option>Electronics</option>
                <option>Furniture</option>
                <option>Vehicles</option>
                <option>Clothing</option>
                <option>Home Goods</option>
                <option>Other</option>
              </select>

              <textarea
                name="description"
                placeholder="Describe condition, details, and anything buyers should know..."
                value={formData.description}
                onChange={handleChange}
                required
              />

              <button type="submit" className="submit-button">Publish Listing</button>
            </form>
          </section>

          <section>
            <div className="section-header">
              <div>
                <h2>Trending now</h2>
                <p className="section-subtitle">Fresh listings from your local community.</p>
              </div>
              <span className="listing-count">{filteredListings.length} listings</span>
            </div>

            {filteredListings.length === 0 ? (
              <div className="empty-state">
                <h3>No listings found</h3>
                <p>Create a listing or try a different search/category.</p>
              </div>
            ) : (
              <div className="listing-grid">
                {filteredListings.map((item) => (
                  <article className="card" key={item.id}>
                    <div className="image-placeholder">{item.category}</div>
                    <div className="card-content">
                      <p className="card-category">{item.category}</p>
                      <h3>{item.title}</h3>
                      <p className="price">{item.price}</p>
                      <p className="location">{item.location}</p>
                      <p className="description">{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;