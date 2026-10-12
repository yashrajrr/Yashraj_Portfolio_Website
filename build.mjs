import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const files = [
    "index.html",
    "admin.html",
    "main.js",
    "admin.js",
    "appearance.js",
    "content.js",
    "content-store.js",
    "supabase-client.js"
];

files.forEach((file) => cpSync(resolve(root, file), resolve(dist, file)));

[
    ["asset", "asset"],
    ["admin", "admin"]
].forEach(([source, destination]) => {
    if (existsSync(resolve(root, source))) cpSync(resolve(root, source), resolve(dist, destination), { recursive: true });
});

console.log(`Prepared ${dist}`);
