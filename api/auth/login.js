"use strict";
var crypto = require("node:crypto");
var auth = require("../../lib/auth");

module.exports = async function handler(request, response) {
    response.setHeader("Cache-Control", "no-store");
    if (request.method !== "POST") { response.setHeader("Allow", "POST"); return response.status(405).json({ error: "Method not allowed." }); }
    if (!auth.sameOrigin(request)) return response.status(403).json({ error: "Request origin is not allowed." });
    var expectedEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    var expectedPassword = process.env.ADMIN_PASSWORD || "";
    var secret = (process.env.SESSION_SECRET || "").trim();
    if (!expectedEmail || !expectedPassword || secret.length < 32) return response.status(503).json({ error: "Set ADMIN_EMAIL, ADMIN_PASSWORD, and a SESSION_SECRET of at least 32 characters in Vercel." });
    try {
        var body = await auth.readBody(request);
        var email = String(body.email || "").trim().toLowerCase();
        var password = String(body.password || "");
        var emailMatch = email === expectedEmail;
        var passwordMatch = Buffer.byteLength(password) === Buffer.byteLength(expectedPassword) && crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expectedPassword));
        if (!emailMatch || !passwordMatch) return response.status(401).json({ error: "Email or password is incorrect." });
        auth.setSessionCookie(request, response, auth.createSession(expectedEmail), auth.SESSION_SECONDS);
        return response.status(200).json({ user: { email: expectedEmail } });
    } catch (error) { return response.status(400).json({ error: error.message || "Invalid request." }); }
};
