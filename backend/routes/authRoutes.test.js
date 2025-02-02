const request = require("supertest");
const app = require("../app"); // Your Express app

describe("Auth Routes", () => {
  it("should sign up a new user", async () => {
    const response = await request(app)
      .post("/auth/signup")
      .send({ username: "testuser", email: "test@example.com", password: "password123" });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("User created successfully");
  });

  it("should not allow duplicate signups", async () => {
    const response = await request(app)
      .post("/auth/signup")
      .send({ username: "testuser", email: "test@example.com", password: "password123" });

    expect(response.statusCode).toBe(400);
  });
});
