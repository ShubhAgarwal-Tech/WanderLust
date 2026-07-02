const Joi = require("joi");
const { CATEGORY_IDS, PROPERTY_TYPES, AMENITIES } = require("./utils/categories");

module.exports.ListingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().trim().min(3).max(120).required(),
    description: Joi.string().trim().min(20).max(5000).required(),
    category: Joi.string()
      .valid(...CATEGORY_IDS)
      .required(),
    propertyType: Joi.string()
      .valid(...PROPERTY_TYPES)
      .optional(),
    country: Joi.string().trim().min(2).max(80).required(),
    location: Joi.string().trim().min(2).max(120).required(),
    price: Joi.number().required().min(0).max(10000000),
    maxGuests: Joi.number().integer().min(1).max(16).optional(),
    amenities: Joi.alternatives()
      .try(Joi.array().items(Joi.string().valid(...AMENITIES)), Joi.string().valid(...AMENITIES))
      .optional(),
    coordinates: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional(),
    }).optional(),
    image: Joi.string().allow("", null),
    images: Joi.array().items(Joi.string().allow("", null)).optional(),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});

module.exports.bookingSchema = Joi.object({
  booking: Joi.object({
    checkIn: Joi.date().required(),
    checkOut: Joi.date().greater(Joi.ref("checkIn")).required(),
    guests: Joi.number().integer().min(1).max(16).optional(),
  }).required(),
});
