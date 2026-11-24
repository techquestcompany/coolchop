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
const { User } = require("../models");
const authenticateRiderSocket = require("../utils/riderSocketAuth");

const secret = "rider-socket-tests-use-a-local-secret";
process.env.JWT_SECRET = secret;

let riderIsActive = true;
User.findByPk = async (id) => ({
  id: Number(id),
  role: Number(id) === 42 ? "rider" : "customer",
  isActive: riderIsActive,
});

const authenticate = (claims) =>
  new Promise((resolve) => {
    const socket = {
      handshake: {
        auth: claims
          ? { token: jwt.sign(claims, secret) }
          : {},
      },
      data: {},
    };
    authenticateRiderSocket(socket, (error) =>
      resolve({ error, riderId: socket.data.riderId })
    );
  });

test("rider socket auth accepts rider JWT and sets the rider ID", async () => {
  riderIsActive = true;
  const result = await authenticate({ id: "42", role: "rider" });

  assert.equal(result.error, undefined);
  assert.equal(result.riderId, 42);
});

test("rider socket auth rejects customer JWTs", async () => {
  riderIsActive = true;
  const result = await authenticate({ id: 42, role: "customer" });

  assert.match(result.error.message, /Rider access is required/);
});

test("rider socket auth rejects deactivated riders", async () => {
  riderIsActive = false;
  const result = await authenticate({ id: 42, role: "rider" });

  assert.match(result.error.message, /Rider access is required/);
  riderIsActive = true;
});

test("rider socket auth rejects missing and invalid identities", async () => {
  const missingToken = await authenticate(null);
  const invalidIdentity = await authenticate({ id: 0, role: "rider" });

  assert.match(missingToken.error.message, /authentication is required/);
  assert.match(invalidIdentity.error.message, /Rider access is required/);
});
