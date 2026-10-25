const axios = require("axios");

const getAddressFromCoords = async (lat, lon) => {
  try {
    const res = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon,
          format: "json",
        },
        headers: {
          "User-Agent": "FoodDeliveryApp/1.0 (your@email.com)",
        },
      }
    );

    return res.data.display_name || null;
  } catch (err) {
    console.error("Reverse geocoding failed:", err.message);
    return null;
  }
};

module.exports = getAddressFromCoords;
