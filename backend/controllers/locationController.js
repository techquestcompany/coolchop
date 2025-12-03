const {User} = require('../models');
const { decrypt } = require('../utils/encryption');


// Update user location
exports.updateUserLocation = async (req, res) => {
  try {
    const userId = req.user.id; // from token middleware

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { latitude, longitude, confirmLocation } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined ||
      confirmLocation === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await user.update({
      latitude,
      longitude,
      confirm_location: confirmLocation,
    });

    return res.status(200).json({ message: "User location updated successfully" });
  } catch (error) {
    console.error("Error updating user location:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getConfirmLocationById = async (req, res) => {
  try {
    const userId = req.user.id; // from token middleware

    const user = await User.findByPk(userId);
    if (!user)
      return res.status(404).json({ error: "User not found" });

    return res.json({ confirmLocation: user.confirm_location });
  } catch (error) {
    console.error("Error fetching confirm location:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

