const createPaystackHttpError = (statusCode) => {
  const error = new Error(
    statusCode === 401
      ? "Paystack rejected the configured secret key (HTTP 401)."
      : `Paystack returned HTTP ${statusCode}`
  );
  error.statusCode = statusCode;
  error.code = statusCode === 401 ? "PAYSTACK_UNAUTHORIZED" : "PAYSTACK_HTTP_ERROR";
  return error;
};

module.exports = createPaystackHttpError;