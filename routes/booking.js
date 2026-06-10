const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

// CREATE BOOKING
router.post("/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut } = req.body;

    const booking = new Booking({
        listing: id,
        user: req.user._id,
        checkIn,
        checkOut
    });

    await booking.save();

    req.flash("success", "Booking successful!");
    res.redirect(`/listings/${id}`);
});

module.exports = router;
