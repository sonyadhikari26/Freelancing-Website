import React, { useEffect, useRef, useState } from "react";
import "./Gigs.scss";
import GigCard from "../../components/gigCard/GigCard";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

function Gigs() {
  const [sort, setSort] = useState("sales"); // Default sorting by sales
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(""); 
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [deliveryTime, setDeliveryTime] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const minRef = useRef();
  const maxRef = useRef();

  const { search } = useLocation();

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["gigs", sort, category, searchTerm, priceRange, deliveryTime],
    queryFn: () =>
      newRequest
        .get(
          `/gigs${search}${search ? "&" : "?"}min=${
            priceRange.min || ""
          }&max=${priceRange.max || ""}&sort=${sort}&cat=${category}&search=${searchTerm}&delivery=${deliveryTime}`
        )
        .then((res) => res.data),
  });

  const categories = [
    { value: "", label: "All Categories" },
    { value: "design", label: "Graphics & Design" },
    { value: "programming", label: "Programming & Tech" },
    { value: "writing", label: "Writing & Translation" },
    { value: "video", label: "Video & Animation" },
    { value: "marketing", label: "Digital Marketing" },
    { value: "music", label: "Music & Audio" },
    { value: "business", label: "Business" },
    { value: "lifestyle", label: "Lifestyle" }
  ];

  const sortOptions = [
    { value: "sales", label: "Best Selling" },
    { value: "createdAt", label: "Newest" },
    { value: "price", label: "Price: Low to High" },
    { value: "-price", label: "Price: High to Low" },
    { value: "starNumber", label: "Most Reviewed" },
    { value: "totalStars", label: "Highest Rated" }
  ];

  const deliveryOptions = [
    { value: "", label: "Any Delivery Time" },
    { value: "1", label: "1 Day" },
    { value: "3", label: "3 Days" },
    { value: "7", label: "1 Week" },
    { value: "14", label: "2 Weeks" }
  ];

  const reSort = (type) => {
    setSort(type);
    setOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(e.target.search.value);
  };

  const handlePriceFilter = () => {
    setPriceRange({
      min: minRef.current.value,
      max: maxRef.current.value
    });
  };

  const clearFilters = () => {
    setCategory("");
    setSearchTerm("");
    setPriceRange({ min: "", max: "" });
    setDeliveryTime("");
    if (minRef.current) minRef.current.value = "";
    if (maxRef.current) maxRef.current.value = "";
  };

  const apply = () => {
    refetch();
  };

  useEffect(() => {
    refetch();
  }, [sort, category, searchTerm, priceRange, deliveryTime]);

  if (error) {
    toast.error("Failed to load gigs");
  }

  return (
    <div className="gigs">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Find the perfect service for your project</h1>
          <p>Browse thousands of talented freelancers ready to help you succeed</p>
          
          {/* Enhanced Search Bar */}
          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              name="search"
              placeholder="Search for services..."
              defaultValue={searchTerm}
            />
            <button type="submit">
              <img src="/img/search.png" alt="Search" />
            </button>
          </form>
        </div>
      </div>

      <div className="container">
        {/* Filter Header */}
        <div className="filter-header">
          <div className="filter-left">
            <span className="results-count">
              {data ? `${data.length} services available` : "Loading..."}
            </span>
            <button 
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <img src="/img/filter.png" alt="Filter" />
              Filters {showFilters ? "▲" : "▼"}
            </button>
          </div>
          
          <div className="sort-section">
            <span className="sortBy">Sort by:</span>
            <div className="sort-dropdown">
              <span onClick={() => setOpen(!open)} className="sortType">
                {sortOptions.find(opt => opt.value === sort)?.label || "Best Selling"}
                <img src="/img/down.png" alt="" />
              </span>
              {open && (
                <div className="rightMenu">
                  {sortOptions.map((option) => (
                    <span
                      key={option.value}
                      onClick={() => reSort(option.value)}
                      className={sort === option.value ? "active" : ""}
                    >
                      {option.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-grid">
              {/* Category Filter */}
              <div className="filter-group">
                <label>Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="filter-group">
                <label>Price Range</label>
                <div className="price-inputs">
                  <input
                    ref={minRef}
                    type="number"
                    placeholder="Min"
                    min={0}
                  />
                  <span>to</span>
                  <input
                    ref={maxRef}
                    type="number"
                    placeholder="Max"
                    min={0}
                  />
                </div>
                <button onClick={handlePriceFilter} className="apply-price">
                  Apply
                </button>
              </div>

              {/* Delivery Time Filter */}
              <div className="filter-group">
                <label>Delivery Time</label>
                <select 
                  value={deliveryTime} 
                  onChange={(e) => setDeliveryTime(e.target.value)}
                >
                  {deliveryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Actions */}
              <div className="filter-actions">
                <button onClick={clearFilters} className="clear-filters">
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(category || searchTerm || priceRange.min || priceRange.max || deliveryTime) && (
          <div className="active-filters">
            <span>Active filters:</span>
            {category && (
              <span className="filter-tag">
                {categories.find(cat => cat.value === category)?.label}
                <button onClick={() => setCategory("")}>×</button>
              </span>
            )}
            {searchTerm && (
              <span className="filter-tag">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm("")}>×</button>
              </span>
            )}
            {(priceRange.min || priceRange.max) && (
              <span className="filter-tag">
                Price: ${priceRange.min || "0"} - ${priceRange.max || "∞"}
                <button onClick={() => setPriceRange({ min: "", max: "" })}>×</button>
              </span>
            )}
            {deliveryTime && (
              <span className="filter-tag">
                Delivery: {deliveryOptions.find(opt => opt.value === deliveryTime)?.label}
                <button onClick={() => setDeliveryTime("")}>×</button>
              </span>
            )}
          </div>
        )}

        {/* Gigs Grid */}
        <div className="gigs-grid">
          {isLoading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Loading amazing gigs...</p>
            </div>
          ) : error ? (
            <div className="error">
              <p>Something went wrong while loading gigs!</p>
              <button onClick={() => refetch()}>Try Again</button>
            </div>
          ) : data && data.length > 0 ? (
            data.map((gig) => <GigCard key={gig.id || gig._id} item={gig} />)
          ) : (
            <div className="no-results">
              <img src="/img/no-results.png" alt="No results" />
              <h3>No gigs found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button onClick={clearFilters}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Gigs;
