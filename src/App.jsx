import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

const categories = [
  "All",
  "Electronics",
  "Furniture",
  "Vehicles",
  "Clothing",
  "Home Goods",
  "Other",
];

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("reveal-visible");
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ "--delay": `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="11"
        cy="11"
        r="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m16.5 16.5 4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 12h14M14 7l5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function App() {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [loadingListings, setLoadingListings] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");

  const browseRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    location: "",
    category: "Electronics",
    description: "",
  });

  useEffect(() => {
    async function fetchListings() {
      try {
        const response = await fetch(`${API_URL}/api/listings`);

        if (!response.ok) {
          throw new Error("Backend unavailable");
        }

        const data = await response.json();
        setListings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setMessage(
          "Marketplace data is temporarily unavailable while the backend is offline."
        );
      } finally {
        setLoadingListings(false);
      }
    }

    fetchListings();
  }, []);

  function scrollToBrowse() {
    browseRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (publishing) return;

    try {
      setPublishing(true);
      setMessage("");

      const response = await fetch(`${API_URL}/api/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Could not publish listing.");
      }

      const newListing = await response.json();

      setListings((current) => [newListing, ...current]);

      setFormData({
        title: "",
        price: "",
        location: "",
        category: "Electronics",
        description: "",
      });

      setShowForm(false);
    } catch (error) {
      console.error(error);
      setMessage(
        "The listing could not be published because the backend is currently unavailable."
      );
    } finally {
      setPublishing(false);
    }
  }

  const filteredListings = listings.filter((item) => {
    const searchableText =
      `${item.title || ""} ${item.category || ""} ${item.location || ""} ${
        item.description || ""
      }`.toLowerCase();

    const matchesSearch = searchableText.includes(
      searchTerm.trim().toLowerCase()
    );

    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app">
      <div className="background-grid" />

      <header className="site-header">
        <div className="container nav-inner">
          <button className="brand" type="button">
            <span className="brand-mark">S</span>
            <span className="brand-name">Swap</span>
          </button>

          <nav className="nav-links">
            <button type="button" onClick={scrollToBrowse}>
              Marketplace
            </button>

            <button
              type="button"
              onClick={() =>
                document
                  .querySelector("#categories")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Categories
            </button>

            <button
              type="button"
              onClick={() =>
                document
                  .querySelector("#about")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              About
            </button>
          </nav>

          <div className="nav-actions">
            <button className="sign-in-button" type="button">
              Sign in
            </button>

            <button
              className="nav-sell-button"
              type="button"
              onClick={() => setShowForm(true)}
            >
              Sell an item
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-layout">
            <div className="hero-copy">
              <div className="hero-status hero-enter hero-enter-1">
                <span className="live-dot" />
                Local marketplace · Buy · Sell · Reuse
              </div>

              <h1 className="hero-enter hero-enter-2">
                Things worth
                <br />
                <span>keeping.</span>
              </h1>

              <p className="hero-subtitle hero-enter hero-enter-3">
                A cleaner way to buy and sell locally.
              </p>

              <p className="hero-description hero-enter hero-enter-4">
                Find useful things nearby, give your old items another life,
                and connect directly with people in your community.
              </p>

              <div className="hero-buttons hero-enter hero-enter-5">
                <button
                  type="button"
                  className="primary-action"
                  onClick={scrollToBrowse}
                >
                  Browse listings
                </button>

                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => setShowForm(true)}
                >
                  Sell something
                  <ArrowIcon />
                </button>
              </div>

              <div className="hero-small-links hero-enter hero-enter-6">
                <span>No listing fees</span>
                <span className="separator">·</span>
                <span>Local discovery</span>
                <span className="separator">·</span>
                <span>Simple posting</span>
              </div>
            </div>

            <div className="market-monitor hero-enter hero-enter-4">
              <div className="monitor-topbar">
                <span>Marketplace Activity</span>

                <div className="monitor-live">
                  <span className="live-dot" />
                  LIVE
                </div>
              </div>

              <div className="monitor-chart">
                <div className="chart-grid" />

                <svg
                  className="activity-chart"
                  viewBox="0 0 600 260"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="lineGlow"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#0095ff" />
                      <stop offset="55%" stopColor="#2fbaff" />
                      <stop offset="100%" stopColor="#46d6ff" />
                    </linearGradient>
                  </defs>

                  <path
                    className="chart-line chart-line-faint"
                    d="M0 186
                       C40 186 54 101 84 101
                       C113 101 116 195 148 195
                       C180 195 178 74 213 74
                       C247 74 249 177 281 177
                       C314 177 318 92 350 92
                       C381 92 383 201 419 201
                       C452 201 455 87 489 87
                       C524 87 525 168 558 168
                       C575 168 589 134 600 118"
                  />

                  <path
                    className="chart-line"
                    d="M0 186
                       C40 186 54 101 84 101
                       C113 101 116 195 148 195
                       C180 195 178 74 213 74
                       C247 74 249 177 281 177
                       C314 177 318 92 350 92
                       C381 92 383 201 419 201
                       C452 201 455 87 489 87
                       C524 87 525 168 558 168
                       C575 168 589 134 600 118"
                  />
                </svg>
              </div>

              <div className="monitor-footer">
                <span className="live-dot" />
                <span>
                  {listings.length} active listing
                  {listings.length === 1 ? "" : "s"}
                </span>

                <span className="monitor-divider">·</span>

                <span>Swap Local</span>
              </div>
            </div>
          </div>
        </section>

        <section className="status-section">
          <div className="container">
            <Reveal>
              <div className="section-label">
                <span className="live-dot" />
                Marketplace Status
              </div>

              <div className="section-title-row">
                <div>
                  <h2>Built around simple exchanges.</h2>
                  <p>
                    Less clutter. Less friction. Just useful things and local
                    people.
                  </p>
                </div>

                <span className="status-badge">
                  <span className="live-dot" />
                  Marketplace online
                </span>
              </div>
            </Reveal>

            <div className="metrics-grid">
              <Reveal delay={0}>
                <div className="metric-card">
                  <span className="metric-name">Active Listings</span>

                  <strong>{listings.length}</strong>

                  <span className="metric-detail">
                    Items currently available
                  </span>
                </div>
              </Reveal>

              <Reveal delay={55}>
                <div className="metric-card">
                  <span className="metric-name">Posting</span>

                  <strong>Fast</strong>

                  <span className="metric-detail">
                    Create a listing in seconds
                  </span>
                </div>
              </Reveal>

              <Reveal delay={110}>
                <div className="metric-card">
                  <span className="metric-name">Discovery</span>

                  <strong>Local</strong>

                  <span className="metric-detail">
                    Search by item and category
                  </span>
                </div>
              </Reveal>

              <Reveal delay={165}>
                <div className="metric-card">
                  <span className="metric-name">Listing Fee</span>

                  <strong>$0</strong>

                  <span className="metric-detail">
                    Simple community marketplace
                  </span>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="categories" className="categories-section">
          <div className="container">
            <Reveal>
              <div className="section-label">Browse</div>

              <div className="section-title-row">
                <div>
                  <h2>Categories</h2>
                  <p>Start broad, then find exactly what you need.</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={70}>
              <div className="category-list">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={
                      activeCategory === category
                        ? "category-button active"
                        : "category-button"
                    }
                    onClick={() => {
                      setActiveCategory(category);
                      scrollToBrowse();
                    }}
                  >
                    <span>{category}</span>
                    <span className="category-arrow">↗</span>
                  </button>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section
          ref={browseRef}
          id="marketplace"
          className="marketplace-section"
        >
          <div className="container">
            <Reveal>
              <div className="section-label">Marketplace</div>

              <div className="marketplace-heading">
                <div>
                  <h2>Fresh listings</h2>

                  <p>
                    Things recently posted by people in the community.
                  </p>
                </div>

                <div className="listing-number">
                  {String(filteredListings.length).padStart(2, "0")}
                </div>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <div className="market-search">
                <SearchIcon />

                <input
                  type="text"
                  placeholder="Search the marketplace..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />

                {searchTerm && (
                  <button
                    type="button"
                    className="clear-search"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear
                  </button>
                )}
              </div>
            </Reveal>

            {message && (
              <Reveal delay={80}>
                <div className="system-message">
                  <span className="system-indicator" />
                  {message}
                </div>
              </Reveal>
            )}

            {loadingListings ? (
              <Reveal delay={100}>
                <div className="empty-market">
                  <span className="eyebrow">SYNCING MARKETPLACE</span>
                  <h3>Loading listings...</h3>
                </div>
              </Reveal>
            ) : filteredListings.length === 0 ? (
              <Reveal delay={100}>
                <div className="empty-market">
                  <span className="eyebrow">NO RESULTS</span>

                  <h3>Nothing here yet.</h3>

                  <p>
                    Try a different search or post the first listing.
                  </p>

                  <button
                    type="button"
                    className="primary-action"
                    onClick={() => setShowForm(true)}
                  >
                    Create listing
                  </button>
                </div>
              </Reveal>
            ) : (
              <div className="listing-grid">
                {filteredListings.map((item, index) => (
                  <Reveal
                    key={item.id || `${item.title}-${index}`}
                    delay={(index % 4) * 55}
                  >
                    <article className="listing-card">
                      <div className="listing-image">
                        <div className="listing-image-grid" />

                        <span className="listing-category-label">
                          {item.category}
                        </span>

                        <span className="listing-index">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <div className="listing-content">
                        <div className="listing-main-info">
                          <h3>{item.title}</h3>
                          <strong>{item.price}</strong>
                        </div>

                        <div className="listing-location">
                          {item.location}
                        </div>

                        {item.description && (
                          <p>{item.description}</p>
                        )}

                        <div className="listing-bottom">
                          <span>View listing</span>
                          <ArrowIcon />
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="about" className="about-section">
          <div className="container">
            <Reveal>
              <div className="section-label">About Swap</div>

              <div className="about-layout">
                <h2>
                  A marketplace designed to feel simple from the first click.
                </h2>

                <div className="about-copy">
                  <p>
                    Swap is built around a straightforward idea: useful items
                    should be easy to discover, easy to list, and easy to keep
                    in circulation.
                  </p>

                  <p>
                    Search locally, browse by category, and post something you
                    no longer need without fighting through a cluttered
                    interface.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <span className="brand-mark">S</span>
            <span>Swap</span>
          </div>

          <span>Buy better · Sell simpler</span>
        </div>
      </footer>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <div className="listing-modal">
            <div className="modal-header">
              <div>
                <span className="section-label">New Listing</span>
                <h2>Sell something.</h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="listing-form">
              <div className="form-two-column">
                <label>
                  <span>Item title</span>

                  <input
                    name="title"
                    placeholder="iPhone 15 Pro"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span>Price</span>

                  <input
                    name="price"
                    placeholder="$500"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="form-two-column">
                <label>
                  <span>Location</span>

                  <input
                    name="location"
                    placeholder="Hayward, CA"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span>Category</span>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {categories
                      .filter((category) => category !== "All")
                      .map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                  </select>
                </label>
              </div>

              <label>
                <span>Description</span>

                <textarea
                  name="description"
                  placeholder="Condition, details, and anything buyers should know..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="publish-button"
                  disabled={publishing}
                >
                  {publishing ? "Publishing..." : "Publish listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;