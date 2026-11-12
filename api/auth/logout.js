"use strict";
var auth = require("../../lib/auth");
module.exports = function handler(request, response) {
    response.setHeader("Cache-Control", "no-store");
    if (request.method !== "POST") { response.setHeader("Allow", "POST"); return response.status(405).json({ error: "Method not allowed." }); }
    if (!auth.sameOrigin(request)) return response.status(403).json({ error: "Request origin is not allowed." });
    auth.setSessionCookie(request, response, "", 0);
    return response.status(200).json({ user: null });
};
