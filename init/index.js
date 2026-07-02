const mongoose = require("mongoose");
const { LISTING_CATALOG } = require("../utils/listingCatalog.js");
const { normalizeListingImage } = require("../utils/provenImages.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");

main()
  .then(() => console.log("connected to Database"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const REVIEW_COMMENTS = [
  "Loved the stay—super clean and exactly as described.",
  "Great location and smooth check-in. Would book again.",
  "The view was amazing and the place felt very cozy.",
  "Perfect for a weekend getaway. Host was responsive.",
  "Fantastic experience. Everything was spotless.",
];

function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const initDB = async () => {
  await Listing.deleteMany({});
  await Review.deleteMany({});

  let seedUser = await User.findOne({ username: "demo" });
  if (!seedUser) {
    seedUser = new User({ username: "demo", email: "demo@wanderlust.local" });
    seedUser = await User.register(seedUser, "password");
  }

  const docs = LISTING_CATALOG.map((entry) =>
    normalizeListingImage({
      ...entry,
      owner: seedUser._id,
      images: entry.images || (entry.image ? [entry.image] : []),
    })
  );

  const insertedListings = await Listing.insertMany(docs);

  for (const listing of insertedListings) {
    const reviewCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < reviewCount; i++) {
      const review = await Review.create({
        comment: sample(REVIEW_COMMENTS),
        rating: 3 + Math.floor(Math.random() * 3),
        author: seedUser._id,
      });
      listing.reviews.push(review._id);
    }
    await listing.save();
  }

  console.log(`Initialized ${insertedListings.length} curated listings`);
  process.exit(0);
};

initDB();
