import { rateLimit } from "express-rate-limit";

// General limiter applied to every auth endpoint.
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "too many requests, please try again later" },
});

// Stricter limiter for endpoints that check credentials or otps, to slow
// down brute forcing. Successful requests are not counted so legitimate
// users are not locked out.
export const credentialLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { message: "too many attempts, please try again later" },
});
