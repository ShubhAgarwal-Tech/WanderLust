# 🏡 WanderLust – Full-Stack Property Listing Platform

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge)
![Passport.js](https://img.shields.io/badge/Passport.js-34E27A?style=for-the-badge&logo=passport&logoColor=black)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**A production-ready full-stack property rental marketplace inspired by Airbnb, enabling users to discover, host, book, and manage rental properties through a secure and scalable web application.**

### 🚀 Live Link

🌐 **https://wanderlust-tm3w.onrender.com**

</div>

---

# 📖 Overview

WanderLust is a **full-stack accommodation booking platform** that allows users to explore, list, review, favorite, and book rental properties. Built using the **Node.js + Express + MongoDB** ecosystem, the application follows the **MVC architecture** and includes secure authentication, cloud image management, interactive maps, booking workflows, payment integration, and advanced property discovery.

The platform emphasizes scalable backend architecture, clean code organization, secure user authentication, and an intuitive user experience while simulating the core functionalities of modern vacation rental platforms.

---

# ✨ Features

### 🏠 Property Listings

- Create, edit, and delete listings
- Rich property information
- Multiple property categories
- Property type support
- Amenities management

### 🔍 Smart Search & Filtering

- Search properties
- Category filters
- Price filters
- Guest filters
- Property type filters
- Amenities filters
- Rating-based sorting
- Pagination
- Similar listings

### ❤️ Wishlist

- Save favorite properties
- Optimistic UI updates
- Personalized wishlist management

### ⭐ Reviews & Ratings

- Post reviews
- Edit/Delete own reviews
- Average rating calculation
- Review count aggregation

### 📅 Booking System

- Booking availability validation
- Date overlap detection
- Booking history
- Booking cancellation
- Reservation management

### 💳 Secure Payments

- Razorpay payment integration
- Secure checkout
- HMAC SHA-256 payment verification
- Payment confirmation workflow

### 🗺 Maps Integration

- Interactive Leaflet maps
- OpenStreetMap integration
- Property location visualization

### ☁ Cloud Image Management

- Cloudinary integration
- Multer file uploads
- Image optimization
- File validation
- Image fallback handling

### 🔐 Authentication & Security

- User Registration & Login
- Passport.js Authentication
- MongoDB Session Store
- Protected Routes
- Authorization Middleware
- Joi Validation
- HTTP-only Cookies

### 🎨 Modern User Experience

- Responsive Design
- Dark Mode
- Toast Notifications
- PJAX-style Navigation
- Lazy Image Loading
- Flash Messages

---

# 🛠 Tech Stack

| Category | Technologies |
|-----------|-------------|
| **Frontend** | HTML5, CSS3, Bootstrap 5, EJS, JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | Passport.js, Passport Local, Connect-Mongo |
| **Validation** | Joi |
| **Cloud Storage** | Cloudinary, Multer |
| **Maps** | Leaflet.js, OpenStreetMap |
| **Payments** | Razorpay |
| **Architecture** | MVC |
| **Version Control** | Git, GitHub |
| **Deployment** | Render |

---

# 🏗 Architecture

The project follows a modular **Model-View-Controller (MVC)** architecture.

```
Client
   │
   ▼
Routes
   │
Middleware
   │
Controllers
   │
Models (Mongoose)
   │
MongoDB Database
```

---

# 🚀 Key Engineering Highlights

- MVC-based backend architecture
- RESTful routing
- Secure Passport.js authentication
- MongoDB-backed session persistence
- Role-based ownership authorization
- MongoDB aggregation pipelines
- Cloudinary image upload pipeline
- Razorpay payment gateway integration
- Booking availability validation
- Interactive property maps
- Reusable EJS layouts & partials
- Modular middleware and utilities
- Server-side validation using Joi
- Optimistic UI updates
- Environment-based configuration

---

# ⚡ Performance Optimizations

- MongoDB aggregation pipelines for filtering
- Pagination for large datasets
- Lazy-loaded images
- Deferred JavaScript loading
- PJAX-style navigation
- Optimistic wishlist updates
- Efficient MongoDB queries
- Image fallback normalization
  
---

# ⚙ Installation

Clone the repository

```bash
git clone https://github.com/ShubhAgarwal-Tech/WanderLust.git
```

Navigate into the project

```bash
cd WanderLust
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
ATLASDB_URL=

SECRET=

CLOUD_NAME=

CLOUD_API_KEY=

CLOUD_API_SECRET=

MAP_TOKEN=

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=
```

Run the project

```bash
npm start
```

Visit

```
http://localhost:8080
```

---

# 📂 Core Modules

### Authentication

- Signup
- Login
- Logout
- Session Management

### Listings

- Create
- Update
- Delete
- Search
- Filter

### Reviews

- Add Review
- Delete Review
- Ratings

### Bookings

- Availability Checks
- Booking History
- Cancellation

### Wishlist

- Add Favorites
- Remove Favorites

### Payments

- Razorpay Checkout
- Payment Verification

---

# 🔒 Security Features

- Passport.js Authentication
- Protected Routes
- Ownership Authorization
- Joi Server-side Validation
- HTTP-only Cookies
- File Upload Validation
- HMAC Payment Verification
- Secure Session Storage

---

# 📈 Project Statistics

- ✅ 26 HTTP Endpoints
- ✅ 4 Mongoose Models
- ✅ 5 Controllers
- ✅ 4 Route Modules
- ✅ 20+ EJS Templates
- ✅ MongoDB Aggregation Pipelines
- ✅ Razorpay Payment Integration
- ✅ Cloudinary Media Storage

---

# 🛣 Future Enhancements

- [ ] Google OAuth Authentication
- [ ] Admin Dashboard
- [ ] Real-time Chat
- [ ] Email Notifications
- [ ] AI-powered Property Recommendations
- [ ] Property Analytics Dashboard
- [ ] Stripe Payment Integration
- [ ] Multi-language Support
- [ ] Real-time Availability Updates

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

<div align="center">

⭐ If you found this project helpful, consider giving it a star!

</div>
