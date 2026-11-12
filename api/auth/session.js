"use strict";
var auth = require("../../lib/auth");
module.exports = function handler(request, response) {
    response.setHeader("Cache-Control", "no-store");
    if (request.method !== "GET") { response.setHeader("Allow", "GET"); return response.status(405).json({ error: "Method not allowed." }); }
    if (!(process.env.ADMIN_EMAIL || "").trim() || !(process.env.ADMIN_PASSWORD || "") || (process.env.SESSION_SECRET || "").trim().length < 32) return response.status(503).json({ error: "Vercel admin login is not configured." });
    var session = auth.getSession(request);
    if (!session) return response.status(200).json({ user: null });
    return response.status(200).json({ user: { email: session.email } });
};
