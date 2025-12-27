import rateLimit from "express-rate-limit";

export const sponsorshipRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                  // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many sponsorship requests. Please try again later."
  }
});

