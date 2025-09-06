# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Development Commands

### Development Server
- `npm run dev` - Start development server with nodemon (auto-restart on changes)
- `npm start` - Start production server using Node.js
- `npm test` - Run tests (currently not configured)

### Environment Setup
Ensure you have a `.env` file with:
```
DATABASE_URL=mongodb://...
JWT_SECRET_KEY=your_jwt_secret
PORT=5000
```

### Database Operations
- The app automatically connects to MongoDB on startup
- Database seeding happens automatically when the connection is established
- Character data and quiz data are seeded on server start

## Architecture Overview

### High-Level Structure
This is a RESTful API built with Node.js/Express following MVC architecture:

```
Scripture-Mirror-API/
├── server.js              # Entry point - HTTP server setup
├── api/
│   ├── app.js             # Express app configuration & routing
│   ├── models/            # Mongoose schemas
│   ├── controllers/       # Business logic
│   ├── routes/            # API endpoint definitions
│   ├── middlewares/       # Authentication & other middleware
│   └── helpers/           # Utility functions
```

### Core Domain Models
- **User**: Authentication, profiles, quiz history, reflections, bookmarks
- **BiblicalCharacter**: Character traits, challenges, themes for matching
- **DailyScripture**: Daily Bible verses with metadata
- **QuizSection/QuizQuestion**: Personality assessment system
- **QuizSubmission**: User quiz responses and scoring

### Key API Endpoints
- `/api/accounts/*` - User auth, registration, biblical character matching
- `/api/daily-scripture/*` - Daily Bible verse management
- `/api/character-match/*` - Biblical personality matching system
- `/api/daily-quiz/*` - Bible quiz functionality
- `/api/reflections/*` - User spiritual reflections
- `/api/payment/*` - Payment processing (PayPal, Paystack, Stripe)

### Character Matching System
The core feature matches users with biblical characters based on:
1. Personality quiz responses (5 sections, multiple questions each)
2. Natural language processing for trait analysis
3. Scoring algorithm in `character_matcher.js` helper
4. Name meaning analysis integration

### Authentication Flow
- JWT-based authentication with 24-hour expiration
- Email OTP verification system for registration/password reset
- Protected routes use `authenticationMiddleware.authenticate`
- Password hashing with bcrypt (12 rounds)

### Database Integration
- MongoDB with Mongoose ODM
- Automatic seeding of biblical characters and quiz data
- User bookmarks stored as embedded documents
- Quiz history tracked per user with detailed results

### Payment Integration
Supports multiple payment providers:
- PayPal Checkout SDK
- Paystack API
- Stripe SDK

### Deployment
- Configured for Vercel deployment via `vercel.json`
- Uses `@vercel/node` builder for serverless deployment
- All routes proxied through `server.js`

## Development Notes

### Testing Individual Features
To test specific functionality:
```bash
# Test character matching
curl -X POST http://localhost:5000/api/accounts/find-match -H "Authorization: Bearer <token>"

# Test daily scripture
curl http://localhost:5000/api/daily-scripture/get -H "Authorization: Bearer <token>"

# Test quiz sections
curl http://localhost:5000/api/daily-quiz/sections
```

### Database Seeding
Characters and quiz data auto-seed on startup. Check console logs for:
- "Database Connected"
- "Quiz sections seeded successfully"
- Character seeding confirmations

### Email System
Email OTP functionality requires proper email service configuration in helpers/email_sender.js.

### Natural Language Processing
Uses the `natural` npm package for text analysis in character matching algorithms.
