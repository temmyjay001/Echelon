import React, { useEffect, useState, useRef } from "react";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";
import { FixedSizeList as List } from "react-window";

const ITEM_HEIGHT = 60;
const CONTAINER_HEIGHT = 400;

// Item component for virtualization
const ItemRow = ({ index, style, data }) => {
  const { items } = data;
  const item = items[index];

  return (
    <div style={{ ...style, padding: "10px", borderBottom: "1px solid #eee" }}>
      <Link to={`/items/${item.id}`} style={{ textDecoration: "none" }}>
        <div>{item.name}</div>
        <div style={{ color: "#666", fontSize: "0.9em" }}>
          {item.category} - ${item.price}
        </div>
      </Link>
    </div>
  );
};

function Items() {
  const { items, fetchItems } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadItems = async () => {
      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "20",
        });

        if (searchQuery) {
          params.append("q", searchQuery);
        }

        const response = await fetch(`/api/items?${params}`, {
          signal: abortControllerRef.current.signal,
        });

        const data = await response.json();

        // Only update state if component is still mounted
        if (isMounted) {
          fetchItems(data);
        }
      } catch (error) {
        if (error.name !== "AbortError" && isMounted) {
          console.error("Error loading items:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadItems();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentPage, searchQuery, fetchItems]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  if (loading && items.length === 0) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Items</h1>

      {/* Search */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={handleSearch}
          style={{
            padding: "8px",
            width: "300px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* Items List with Virtualization */}
      {items.length > 0 ? (
        <div style={{ border: "1px solid #ddd", borderRadius: "4px" }}>
          <List
            height={Math.min(CONTAINER_HEIGHT, items.length * ITEM_HEIGHT)}
            itemCount={items.length}
            itemSize={ITEM_HEIGHT}
            itemData={{ items }}
          >
            {ItemRow}
          </List>
        </div>
      ) : (
        <div>No items found</div>
      )}

      {/* Simple Pagination */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1 || loading}
          style={{ marginRight: "10px" }}
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={loading}
          style={{ marginLeft: "10px" }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Items;