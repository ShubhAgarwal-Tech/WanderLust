const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { CATEGORY_IDS, PROPERTY_TYPES, AMENITIES } = require("../utils/categories");

const ListingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    image: {
      url: String,
      filename: String,
    },
    images: [
      {
        url: String,
        filename: String,
      },
    ],
    category: {
      type: String,
      enum: CATEGORY_IDS,
      default: "Trending",
    },
    propertyType: {
      type: String,
      enum: PROPERTY_TYPES,
      default: "Entire place",
    },
    amenities: [
      {
        type: String,
        enum: AMENITIES,
      },
    ],
    maxGuests: {
      type: Number,
      default: 2,
      min: 1,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

ListingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", ListingSchema);
module.exports = Listing;
