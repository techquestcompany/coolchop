"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const authenticateRiderSocket = require("../utils/riderSocketAuth");

const secret = "rider-socket-tests-use-a-local-secret";
process.env.JWT_SECRET = secret;

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
  const result = await authenticate({ id: "42", role: "rider" });

  assert.equal(result.error, undefined);
  assert.equal(result.riderId, 42);
});

test("rider socket auth rejects customer JWTs", async () => {
  const result = await authenticate({ id: 42, role: "customer" });

  assert.match(result.error.message, /Rider access is required/);
});

test("rider socket auth rejects missing and invalid identities", async () => {
  const missingToken = await authenticate(null);
  const invalidIdentity = await authenticate({ id: 0, role: "rider" });

  assert.match(missingToken.error.message, /authentication is required/);
  assert.match(invalidIdentity.error.message, /Rider access is required/);
});
