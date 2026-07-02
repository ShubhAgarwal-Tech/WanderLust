const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");

const sampleReviews = [
  {
    comment: "Amazing place! The views were breathtaking and the host was very welcoming.",
    rating: 5,
  },
  {
    comment: "Great location and clean accommodation. Would definitely recommend!",
    rating: 4,
  },
  {
    comment: "Cozy and comfortable. Perfect for a weekend getaway.",
    rating: 4,
  },
  {
    comment: "The place was exactly as described. Very satisfied with the stay.",
    rating: 5,
  },
  {
    comment: "Good value for money. Clean and well-maintained.",
    rating: 4,
  },
  {
    comment: "Beautiful property with stunning surroundings. Highly recommended!",
    rating: 5,
  },
  {
    comment: "Comfortable stay with all amenities. The host was very responsive.",
    rating: 4,
  },
  {
    comment: "Lovely place to relax and unwind. Will visit again!",
    rating: 5,
  },
  {
    comment: "Excellent location and great hospitality. Five stars!",
    rating: 5,
  },
  {
    comment: "Nice and peaceful environment. Enjoyed the stay thoroughly.",
    rating: 4,
  },
  {
    comment: "The property exceeded my expectations. Very impressed!",
    rating: 5,
  },
  {
    comment: "Clean, comfortable, and well-equipped. Great experience!",
    rating: 4,
  },
  {
    comment: "Wonderful place with amazing amenities. Highly recommended.",
    rating: 5,
  },
  {
    comment: "Perfect for a family vacation. Kids loved it!",
    rating: 5,
  },
  {
    comment: "Beautiful and serene location. A true gem!",
    rating: 5,
  },
];

async function seedReviews() {
  try {
    // Create sample users
    const users = [];
    for (let i = 1; i <= 5; i++) {
      const user = new User({
        email: `user${i}@example.com`,
        username: `traveler${i}`,
      });
      await User.register(user, "password123");
      users.push(user);
    }

    // Get all listings
    const listings = await Listing.find({});

    // Add reviews to listings
    for (const listing of listings) {
      const numReviews = Math.floor(Math.random() * 4) + 1; // 1-4 reviews per listing
      const shuffledUsers = users.sort(() => 0.5 - Math.random());
      const selectedUsers = shuffledUsers.slice(0, numReviews);

      for (const user of selectedUsers) {
        const randomReview = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
        const review = new Review({
          ...randomReview,
          author: user._id,
        });

        await review.save();
        listing.reviews.push(review._id);
      }

      await listing.save();
    }

    console.log("Reviews seeded successfully!");
  } catch (error) {
    console.error("Error seeding reviews:", error);
  }
}

module.exports = seedReviews;