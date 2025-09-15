const request = require("supertest");
const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const itemsRouter = require("../src/routes/items");

const app = express();
app.use(express.json());
app.use("/api/items", itemsRouter);

const TEST_DATA_PATH = path.join(__dirname, "../../../data/items.json");
const testItems = [
  { id: 1, name: "Test Item 1", category: "Electronics", price: 100 },
  { id: 2, name: "Test Item 2", category: "Furniture", price: 200 },
];

describe("Items API", () => {
  beforeEach(async () => {
    await fs.writeFile(TEST_DATA_PATH, JSON.stringify(testItems, null, 2));
  });

  describe("GET /api/items", () => {
    test("should return items with pagination", async () => {
      const response = await request(app).get("/api/items").expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    test("should filter by search query", async () => {
      const response = await request(app)
        .get("/api/items?q=Test Item 1")
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toContain("Test Item 1");
    });

    test("should handle pagination", async () => {
      const response = await request(app)
        .get("/api/items?page=1&limit=1")
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
    });
  });

  describe("GET /api/items/:id", () => {
    test("should return specific item", async () => {
      const response = await request(app).get("/api/items/1").expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe("Test Item 1");
    });

    test("should return 404 for non-existent item", async () => {
      await request(app).get("/api/items/999").expect(404);
    });
  });

  describe("POST /api/items", () => {
    test("should create new item with valid data", async () => {
      const newItem = {
        name: "New Test Item",
        category: "Books",
        price: 25,
      };

      const response = await request(app)
        .post("/api/items")
        .send(newItem)
        .expect(201);

      expect(response.body.name).toBe(newItem.name);
      expect(response.body.category).toBe(newItem.category);
      expect(response.body.price).toBe(newItem.price);
      expect(response.body).toHaveProperty("id");
    });

    test("should validate required fields", async () => {
      const invalidItem = { name: "Test" };

      await request(app).post("/api/items").send(invalidItem).expect(400);
    });
  });
});
