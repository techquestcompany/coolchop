"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
if (!process.env.DATABASE_URL) {
  process.env.DB_HOST = process.env.DB_HOST || "127.0.0.1";
  process.env.DB_NAME = process.env.DB_NAME || "test";
  process.env.DB_USER = process.env.DB_USER || "test";
  process.env.DB_PASSWORD = process.env.DB_PASSWORD || "test";
}
process.env.JWT_SECRET = "authorization-tests-use-a-local-test-secret";
const { User, Restaurant } = require("../models");
const tokenMiddleware = require("../utils/tokenAuth");
const requireRole = require("../utils/requireRole");
const restaurantController = require("../controllers/resController");

let userIsActive = true;
let restaurantIsVerified = true;
let restaurantIsActive = true;
User.findByPk = async (id) => ({
  id: Number(id),
  role: Number(id) === 2 ? "rider" : "customer",
  isActive: userIsActive,
});
Restaurant.findByPk = async (id) => ({
  id: Number(id),
  isVerified: restaurantIsVerified,
  isActive: restaurantIsActive,
});

const runMiddleware = (middleware, req) =>
  new Promise((resolve) => {
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        resolve({ statusCode: this.statusCode, body });
      },
    };
    middleware(req, res, () => resolve({ statusCode: 200, user: req.user }));
  });

const requestWithToken = (claims) => ({
  get: () => `Bearer ${jwt.sign(claims, process.env.JWT_SECRET)}`,
});

test("bearer middleware accepts a valid identity and normalizes its ID", async () => {
  userIsActive = true;
  const result = await runMiddleware(
    tokenMiddleware,
    requestWithToken({ id: "17", role: "customer" })
  );

  assert.equal(result.statusCode, 200);
  assert.equal(result.user.id, 17);
  assert.equal(result.user.role, "customer");
});

test("bearer middleware does not trust admin claims outside the configured allowlist", async () => {
  userIsActive = true;
  process.env.ADMIN_USER_IDS = "1";
  const approved = await runMiddleware(
    tokenMiddleware,
    requestWithToken({ id: 1, role: "customer", isAdmin: false })
  );
  const unapproved = await runMiddleware(
    tokenMiddleware,
    requestWithToken({ id: 2, role: "admin", isAdmin: true })
  );

  assert.equal(approved.user.role, "admin");
  assert.equal(approved.user.isAdmin, true);
  assert.equal(unapproved.user.role, "rider");
  assert.equal(unapproved.user.isAdmin, false);
  delete process.env.ADMIN_USER_IDS;
});

test("bearer middleware blocks deactivated users and unapproved restaurants", async () => {
  userIsActive = false;
  const inactiveUser = await runMiddleware(
    tokenMiddleware,
    requestWithToken({ id: 17, role: "customer" })
  );
  assert.equal(inactiveUser.statusCode, 403);

  userIsActive = true;
  restaurantIsVerified = false;
  restaurantIsActive = true;
  const pendingRestaurant = await runMiddleware(
    tokenMiddleware,
    requestWithToken({ id: 8, role: "restaurant" })
  );
  assert.equal(pendingRestaurant.statusCode, 403);

  restaurantIsVerified = true;
  restaurantIsActive = false;
  const inactiveRestaurant = await runMiddleware(
    tokenMiddleware,
    requestWithToken({ id: 8, role: "restaurant" })
  );
  assert.equal(inactiveRestaurant.statusCode, 403);

  restaurantIsVerified = true;
  restaurantIsActive = true;
});

test("pending restaurants cannot sign in", async () => {
  const originalFindOne = Restaurant.findOne;
  Restaurant.findOne = async () => ({ isVerified: false, isActive: true });

  const response = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  try {
    await restaurantController.login(
      { body: { email: "pending@example.com", password: "password" } },
      response
    );
    assert.equal(response.statusCode, 403);
    assert.match(response.body.error, /not active or approved/i);
  } finally {
    Restaurant.findOne = originalFindOne;
  }
});

test("bearer middleware rejects tokens without a positive integer identity", async () => {
  const result = await runMiddleware(tokenMiddleware, requestWithToken({ id: 0 }));

  assert.equal(result.statusCode, 403);
  assert.equal(result.body.error, "Invalid token claims");
});

test("a customer cannot access an admin-only route", async () => {
  const customerResult = await runMiddleware(
    requireRole("admin"),
    { user: { id: 17, role: "customer" } }
  );
  const legacyRoleResult = await runMiddleware(
    requireRole("admin"),
    { user: { id: 17, role: "admin", isAdmin: false } }
  );

  assert.equal(customerResult.statusCode, 403);
  assert.equal(legacyRoleResult.statusCode, 403);
});

test("an explicitly flagged administrator passes role checks", async () => {
  const result = await runMiddleware(
    requireRole("admin"),
    { user: { id: 1, role: "admin", isAdmin: true } }
  );

  assert.equal(result.statusCode, 200);
});

test("administrator identity is not an implicit bypass for customer-only routes", async () => {
  const result = await runMiddleware(
    requireRole("customer"),
    { user: { id: 1, role: "admin", isAdmin: true } }
  );

  assert.equal(result.statusCode, 403);
});

test("all migrations expose reversible CommonJS handlers", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const directory = path.join(__dirname, "..", "migrations");
  const names = fs.readdirSync(directory).filter((name) => name.endsWith(".js"));

  assert.ok(names.length > 0);
  for (const name of names) {
    const migration = require(path.join(directory, name));
    assert.equal(typeof migration.up, "function", `${name} should export up`);
    assert.equal(typeof migration.down, "function", `${name} should export down`);
  }
});
