(function (root) {
    "use strict";

    var SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";
    var CONFIG_ENDPOINT = "/api/config";
    var readyPromise = null;
    var sdkPromise = null;
    var client = null;
    var config = null;
    var state = {
        status: "idle",
        configured: false,
        available: false,
        message: "Supabase has not been initialized."
    };

    function copyState() {
        return {
            status: state.status,
            configured: state.configured,
            available: state.available,
            message: state.message,
            projectUrl: config ? config.url : ""
        };
    }

    function errorFromResponse(response, fallback) {
        var detail = response && response.error;
        var message = detail && detail.message ? detail.message : fallback;
        var error = new Error(message);
        if (detail && detail.code) error.code = detail.code;
        if (response && response.status) error.status = response.status;
        return error;
    }

    function publicBrowserKey(key) {
        if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return true;
        var parts = key.split(".");
        if (parts.length !== 3) return false;
        try {
            var payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
            while (payload.length % 4) payload += "=";
            return JSON.parse(root.atob(payload)).role === "anon";
        } catch (error) { return false; }
    }

    function normalizeConfig(value) {
        if (!value || typeof value !== "object") return { error: "Supabase configuration was empty." };

        var url = value.SUPABASE_URL || value.supabaseUrl || value.url;
        var anonKey = value.SUPABASE_ANON_KEY || value.supabaseAnonKey || value.anonKey;
        if (typeof url !== "string" || typeof anonKey !== "string" || !url.trim() || !anonKey.trim()) {
            return { error: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel." };
        }

        url = url.trim().replace(/\/$/, "");
        anonKey = anonKey.trim();
        if (!publicBrowserKey(anonKey)) {
            return { error: "SUPABASE_ANON_KEY must be a public anon or publishable key, never a service-role or secret key." };
        }

        try {
            var parsed = new URL(url);
            var local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1" || parsed.hostname === "[::1]";
            if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && local)) throw new Error("Unsupported protocol");
            if (!parsed.hostname || parsed.username || parsed.password || parsed.search || parsed.hash) throw new Error("Invalid project URL");
        } catch (error) {
            return { error: "SUPABASE_URL must be an HTTPS project URL (HTTP is allowed on localhost)." };
        }

        return { value: { url: url, anonKey: anonKey } };
    }

    function inlineConfig() {
        var candidate = root.__SUPABASE_CONFIG__ || root.SUPABASE_CONFIG;
        if (candidate) return candidate;

        if (typeof document !== "undefined") {
            var urlMeta = document.querySelector('meta[name="supabase-url"]');
            var keyMeta = document.querySelector('meta[name="supabase-anon-key"]');
            if (urlMeta && keyMeta) return { url: urlMeta.content, anonKey: keyMeta.content };
        }
        return null;
    }

    function discoverConfig() {
        var inline = inlineConfig();
        if (inline) {
            var inlineResult = normalizeConfig(inline);
            return inlineResult.value ? Promise.resolve(inlineResult.value) : Promise.reject(new Error(inlineResult.error));
        }

        if (typeof root.fetch !== "function") {
            return Promise.reject(new Error("This browser cannot load Supabase configuration."));
        }

        return fetchWithTimeout(CONFIG_ENDPOINT, {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store",
            headers: { Accept: "application/json" }
        }).then(function (response) {
            if (!response.ok) throw new Error("/api/config is unavailable or misconfigured. Configure the public Supabase environment values in Vercel and redeploy.");
            return response.json();
        }).then(function (value) {
            var result = normalizeConfig(value);
            if (!result.value) throw new Error(result.error);
            return result.value;
        });
    }

    function fetchWithTimeout(url, options) {
        var controller = typeof root.AbortController === "function" ? new root.AbortController() : null;
        var sourceSignal = options && options.signal;
        var abort = function () { if (controller) controller.abort(); };
        var timer;
        if (controller && sourceSignal) {
            if (sourceSignal.aborted) abort();
            else sourceSignal.addEventListener("abort", abort, { once: true });
        }
        var requestOptions = Object.assign({}, options);
        if (controller) requestOptions.signal = controller.signal;
        var request = Promise.resolve().then(function () { return root.fetch(url, requestOptions); });
        var timeout = new Promise(function (resolve, reject) {
            timer = root.setTimeout(function () {
                abort();
                reject(new Error("The Supabase request timed out. Check your connection and try again."));
            }, 15000);
        });
        function cleanup() {
            root.clearTimeout(timer);
            if (sourceSignal && controller) sourceSignal.removeEventListener("abort", abort);
        }
        return Promise.race([request, timeout]).then(function (response) { cleanup(); return response; }, function (error) { cleanup(); throw error; });
    }

    function loadSdk() {
        if (root.supabase && typeof root.supabase.createClient === "function") return Promise.resolve();
        if (sdkPromise) return sdkPromise;
        if (typeof document === "undefined") return Promise.reject(new Error("The Supabase browser SDK needs a document."));

        sdkPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            var settled = false;
            var timer = root.setTimeout(function () { finish(new Error("The Supabase browser SDK timed out. Check CDN access and reload.")); }, 15000);
            function finish(error) {
                if (settled) return;
                settled = true;
                root.clearTimeout(timer);
                script.onload = null; script.onerror = null;
                if (error) { if (script.parentNode) script.parentNode.removeChild(script); reject(error); }
                else resolve();
            }
            script.src = SDK_URL;
            script.async = true;
            script.setAttribute("data-portfolio-supabase-sdk", "true");
            script.onload = function () {
                if (root.supabase && typeof root.supabase.createClient === "function") finish();
                else finish(new Error("The Supabase browser SDK loaded without its global client."));
            };
            script.onerror = function () { finish(new Error("The Supabase browser SDK could not be loaded from the CDN.")); };
            document.head.appendChild(script);
        });
        return sdkPromise;
    }

    function ensureReady() {
        if (readyPromise) return readyPromise;
        state.status = "loading";
        state.message = "Loading Supabase configuration…";
        readyPromise = discoverConfig().then(function (discovered) {
            config = discovered;
            state.configured = true;
            state.message = "Loading the Supabase browser SDK…";
            return loadSdk();
        }).then(function () {
            client = root.supabase.createClient(config.url, config.anonKey, {
                global: { fetch: fetchWithTimeout },
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
            state.status = "ready";
            state.available = true;
            state.message = "Supabase is ready.";
            return copyState();
        }).catch(function (error) {
            client = null;
            state.status = "unavailable";
            state.available = false;
            state.message = error && error.message ? error.message : "Supabase is unavailable.";
            return copyState();
        });
        return readyPromise;
    }

    function requireClient() {
        return ensureReady().then(function (result) {
            if (!client) throw new Error(result.message || "Supabase is unavailable.");
            return client;
        });
    }

    function retry() {
        if (state.status === "unavailable") {
            readyPromise = null; sdkPromise = null; config = null; state.configured = false;
        }
        return ensureReady();
    }

    function unwrap(result, fallback) {
        if (!result || result.error) throw errorFromResponse(result, fallback);
        return result.data;
    }

    function signIn(email, password) {
        return requireClient().then(function (supabase) {
            return supabase.auth.signInWithPassword({ email: email, password: password });
        }).then(function (result) { return unwrap(result, "Sign-in failed."); });
    }

    function signOut() {
        return requireClient().then(function (supabase) { return supabase.auth.signOut({ scope: "local" }); })
            .then(function (result) { return unwrap(result, "Sign-out failed."); });
    }

    function getSession() {
        return requireClient().then(function (supabase) { return supabase.auth.getSession(); })
            .then(function (result) { return unwrap(result, "The current session could not be read."); })
            .then(function (data) { return data && data.session ? data.session : null; });
    }

    function onAuthStateChange(callback) {
        return ensureReady().then(function () {
            if (!client) return function () {};
            var subscribed = true;
            var registration = client.auth.onAuthStateChange(function (event, session) {
                // SDK auth callbacks run while its session lock is held. Defer
                // callers so they can safely query allow-list/content helpers.
                root.setTimeout(function () { if (subscribed) callback(event, session); }, 0);
            });
            return function () {
                subscribed = false;
                if (registration && registration.data && registration.data.subscription) registration.data.subscription.unsubscribe();
            };
        });
    }

    function isAdmin(user) {
        if (!user || !user.id) return Promise.resolve(false);
        return requireClient().then(function (supabase) {
            return supabase.from("portfolio_admins").select("user_id").eq("user_id", user.id).maybeSingle();
        }).then(function (result) {
            return !!unwrap(result, "Administrator access could not be checked.");
        });
    }

    function loadPublishedContent() {
        return requireClient().then(function (supabase) {
            return supabase.from("portfolio_content").select("id,content,schema_version,updated_at").eq("id", "default").maybeSingle();
        }).then(function (result) { return unwrap(result, "Published portfolio content could not be loaded."); });
    }

    function savePublishedContent(content, schemaVersion) {
        if (root.ContentStore) {
            var validation = root.ContentStore.validate(content);
            if (!validation.valid) {
                var error = new Error("Portfolio content failed validation.");
                error.details = validation.errors;
                return Promise.reject(error);
            }
            content = validation.value;
        }
        return requireClient().then(function (supabase) {
            return supabase.from("portfolio_content").upsert({
                id: "default",
                content: content,
                schema_version: schemaVersion || 1
            }, { onConflict: "id" }).select("id,content,schema_version,updated_at").single();
        }).then(function (result) { return unwrap(result, "Published portfolio content could not be saved."); });
    }

    root.PortfolioSupabase = {
        ready: ensureReady,
        retry: retry,
        getState: copyState,
        getSession: getSession,
        onAuthStateChange: onAuthStateChange,
        signIn: signIn,
        signOut: signOut,
        isAdmin: isAdmin,
        loadPublishedContent: loadPublishedContent,
        savePublishedContent: savePublishedContent
    };
}(typeof window !== "undefined" ? window : globalThis));
