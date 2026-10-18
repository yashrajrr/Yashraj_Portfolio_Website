(function (root) {
    "use strict";

    var SCHEMA_VERSION = 1;
    var STORAGE_KEY = "yashraj-portfolio-content:v" + SCHEMA_VERSION;
    var seed = root.PORTFOLIO_CONTENT;

    if (!seed && typeof require === "function") {
        try { seed = require("./content.js"); } catch (ignored) { seed = null; }
    }

    var LIMITS = {
        short: 180,
        medium: 500,
        long: 3000,
        url: 500,
        listItem: 300,
        // Keep embedded PDFs below typical browser localStorage quotas.
        resumeBytes: 1 * 1024 * 1024,
        resumeDataUrl: 1536 * 1024
    };

    var APPEARANCE_OPTIONS = {
        theme: ["midnight", "minimal", "accent", "forest", "ember", "orchid"],
        headingFont: ["Inter", "Manrope", "Plus Jakarta Sans", "DM Sans", "Space Grotesk", "IBM Plex Sans", "Source Sans 3", "Public Sans", "Lora"],
        bodyFont: ["Inter", "Manrope", "Plus Jakarta Sans", "DM Sans", "Space Grotesk", "IBM Plex Sans", "Source Sans 3", "Public Sans", "Lora"],
        radius: ["sharp", "soft", "rounded"],
        animation: ["reduced", "subtle", "full"],
        heroLayout: ["split", "stacked"]
    };

    var SCHEMA = {
        version: SCHEMA_VERSION,
        sections: ["site", "hero", "about", "projects", "skills", "experience", "education", "certifications", "achievements", "contact", "footer", "appearance", "resume"],
        additionalPublicSection: "personalDetails",
        appearanceOptions: APPEARANCE_OPTIONS
    };

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function defaults() {
        if (!seed) {
            throw new Error("Portfolio seed content is unavailable.");
        }
        return clone(seed);
    }

    function isObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    function addError(errors, path, message) {
        errors.push(path + ": " + message);
    }

    function checkString(value, path, max, errors) {
        if (typeof value !== "string") {
            addError(errors, path, "must be text");
            return;
        }
        if (value.length > max) {
            addError(errors, path, "must be no more than " + max + " characters");
        }
        if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) {
            addError(errors, path, "contains unsupported control characters");
        }
    }

    function checkList(value, path, maxItems, itemMax, errors) {
        if (!Array.isArray(value)) {
            addError(errors, path, "must be a list");
            return;
        }
        if (value.length > maxItems) {
            addError(errors, path, "must contain no more than " + maxItems + " items");
        }
        value.forEach(function (item, index) {
            checkString(item, path + "[" + index + "]", itemMax, errors);
        });
    }

    function isSafeUrl(value) {
        if (value === "") return true;
        if (/[\u0000-\u001F\u007F]/.test(value)) return false;
        if (/^(javascript|vbscript|data|file):/i.test(value)) return false;
        if (/^\/\//.test(value)) return false;
        if (/^(https?:|mailto:|tel:|#)/i.test(value)) return !/\s/.test(value);
        // Relative asset paths are useful for a static portfolio. Reject
        // schemes and traversal rather than trying to make them absolute.
        return !/^[a-z][a-z0-9+.-]*:/i.test(value) && !/(^|[\\/])\.\.([\\/]|$)/.test(value);
    }

    function checkUrl(value, path, errors) {
        checkString(value, path, LIMITS.url, errors);
        if (typeof value === "string" && !isSafeUrl(value)) {
            addError(errors, path, "must be a safe http(s), mailto, tel, anchor, or relative URL");
        }
    }

    function checkObject(value, path, errors) {
        if (!isObject(value)) addError(errors, path, "must be an object");
        return isObject(value);
    }

    function has(object, key) {
        return Object.prototype.hasOwnProperty.call(object, key);
    }

    // Only absent additive fields receive defaults. Explicit nulls, wrong types,
    // and other malformed values must still fail validation (including imports).
    function withNewDefaults(value, fallback) {
        var result = {};
        Object.keys(fallback).forEach(function (key) {
            result[key] = has(value, key) ? value[key] : clone(fallback[key]);
        });
        return result;
    }

    function checkAppearance(value, errors) {
        if (!checkObject(value, "appearance", errors)) return null;
        var appearance = withNewDefaults(value, seed.appearance);
        Object.keys(APPEARANCE_OPTIONS).forEach(function (key) {
            if (APPEARANCE_OPTIONS[key].indexOf(appearance[key]) === -1) {
                addError(errors, "appearance." + key, "must be one of " + APPEARANCE_OPTIONS[key].join(", "));
            }
        });
        if (typeof appearance.accentColor !== "string" || !/^#[0-9a-f]{6}$/i.test(appearance.accentColor)) {
            addError(errors, "appearance.accentColor", "must be a six-digit hex color");
        }
        ["sectionVisibility", "navigationVisibility"].forEach(function (key) {
            var visibility = appearance[key];
            if (!checkObject(visibility, "appearance." + key, errors)) return;
            // Preserve boolean editor-only keys from existing version-1 saves.
            Object.keys(visibility).forEach(function (name) {
                if (typeof visibility[name] !== "boolean") addError(errors, "appearance." + key + "." + name, "must be true or false");
            });
            var normalized = withNewDefaults(visibility, seed.appearance[key]);
            Object.keys(normalized).forEach(function (name) {
                if (!has(visibility, name)) visibility = Object.assign({}, visibility, normalized);
            });
            appearance[key] = visibility;
        });
        return appearance;
    }

    function isSafeDownloadUrl(value) {
        if (!value) return true;
        if (value.trim() !== value || /[\\\u0000-\u001F\u007F]/.test(value) || /^\/\//.test(value)) return false;
        if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^https?:\/\//i.test(value)) return false;
        try {
            var decoded = decodeURIComponent(value);
            if (/[\\\u0000-\u001F\u007F]/.test(decoded) || /(^|\/)\.\.([/?#]|$)/.test(decoded)) return false;
            var url = new URL(value, "https://portfolio.invalid/");
            return (url.protocol === "https:" || url.protocol === "http:") && !!url.hostname && !url.username && !url.password;
        } catch (error) { return false; }
    }

    function checkResume(value, errors) {
        if (!checkObject(value, "resume", errors)) return null;
        var resume = withNewDefaults(value, seed.resume);
        checkString(resume.fileName, "resume.fileName", LIMITS.short, errors);
        checkString(resume.fileType, "resume.fileType", LIMITS.short, errors);
        checkString(resume.downloadLabel, "resume.downloadLabel", LIMITS.medium, errors);
        checkString(resume.dataUrl, "resume.dataUrl", LIMITS.resumeDataUrl, errors);
        if (!Number.isInteger(resume.fileSize) || resume.fileSize < 0 || resume.fileSize > LIMITS.resumeBytes) {
            addError(errors, "resume.fileSize", "must be a whole number of bytes between 0 and " + LIMITS.resumeBytes);
        }
        if (typeof resume.fileName === "string" && resume.fileName && (!/^[^\\/\u0000-\u001F\u007F]+\.pdf$/i.test(resume.fileName) || resume.fileName.trim() !== resume.fileName)) {
            addError(errors, "resume.fileName", "must be a PDF file name without a directory path");
        }
        if (resume.fileType !== "" && resume.fileType !== "application/pdf") addError(errors, "resume.fileType", "must be application/pdf or empty");

        if (typeof resume.dataUrl === "string" && resume.dataUrl && resume.dataUrl.length <= LIMITS.resumeDataUrl) {
            var prefix = "data:application/pdf;base64,";
            var payload = resume.dataUrl.slice(prefix.length);
            var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            var padding = payload.endsWith("==") ? 2 : (payload.endsWith("=") ? 1 : 0);
            var unpadded = payload.slice(0, payload.length - padding);
            // Avoid a repeating-group regex on multi-megabyte input. Check exact
            // padding and unused bits as well as the base64 alphabet.
            var base64Valid = resume.dataUrl.indexOf(prefix) === 0 && payload.length > 0 && payload.length % 4 === 0 &&
                !/[^A-Za-z0-9+/]/.test(unpadded) &&
                (!padding || alphabet.indexOf(unpadded.slice(-1)) % (padding === 2 ? 16 : 4) === 0);
            if (!base64Valid) addError(errors, "resume.dataUrl", "must be a valid base64 PDF data URL");
            else {
                var bytes = payload.length / 4 * 3 - padding;
                if (bytes !== resume.fileSize) addError(errors, "resume.fileSize", "must match the decoded PDF size");
                if (payload.indexOf("JVBERi0") !== 0) addError(errors, "resume.dataUrl", "must contain a PDF header (%PDF-)");
            }
            if (!resume.fileName || resume.fileType !== "application/pdf" || resume.fileSize <= 0) {
                addError(errors, "resume", "an embedded PDF requires a file name, application/pdf type, and a positive file size");
            }
            if (resume.downloadUrl && resume.downloadUrl !== resume.dataUrl) addError(errors, "resume.downloadUrl", "must match the embedded PDF or be empty");
        }
        // A validated embedded PDF is the only permitted data: download target.
        if (typeof resume.downloadUrl !== "string" || !resume.dataUrl || resume.downloadUrl !== resume.dataUrl) {
            checkString(resume.downloadUrl, "resume.downloadUrl", LIMITS.url, errors);
            if (typeof resume.downloadUrl === "string" && !isSafeDownloadUrl(resume.downloadUrl)) {
                addError(errors, "resume.downloadUrl", "must be a safe http(s) or relative URL, or the embedded PDF data URL");
            }
        }
        return resume;
    }

    function migrateAdditiveFields(value) {
        var migrated = clone(value);
        if (Array.isArray(migrated.projects)) migrated.projects.forEach(function (project) {
            if (!isObject(project)) return;
            ["problem", "implementation", "results", "githubUrl"].forEach(function (key) { if (!has(project, key)) project[key] = ""; });
        });
        if (Array.isArray(migrated.experience)) migrated.experience.forEach(function (entry) { if (isObject(entry) && !has(entry, "accomplishments")) entry.accomplishments = []; });
        return migrated;
    }

    function validate(data) {
        var errors = [];
        if (!checkObject(data, "content", errors)) return { valid: false, errors: errors };
        data = migrateAdditiveFields(data);
        if (data.schemaVersion !== SCHEMA_VERSION) addError(errors, "schemaVersion", "must be " + SCHEMA_VERSION);
        var appearance = checkAppearance(has(data, "appearance") ? data.appearance : {}, errors);
        var resume = checkResume(has(data, "resume") ? data.resume : {}, errors);

        var scalarGroups = {
            site: ["name", "title", "description", "location", "canonicalUrl"],
            hero: ["eyebrow", "title", "highlight", "description", "primaryCtaLabel", "primaryCtaHref", "secondaryCtaLabel", "secondaryCtaHref", "focusLabel", "focusValue", "focusSkills", "basedInLabel", "basedIn"],
            about: ["eyebrow", "title", "highlight", "image", "imageAlt"],
            contact: ["eyebrow", "title", "description", "linkedin", "github", "phone", "email", "formTitle", "formAction", "formSubject"],
            footer: ["name", "copyright"]
        };
        Object.keys(scalarGroups).forEach(function (group) {
            if (!checkObject(data[group], group, errors)) return;
            scalarGroups[group].forEach(function (key) {
                var path = group + "." + key;
                var value = data[group][key];
                if (/Href|Url|linkedin|github|formAction|^image$/.test(key)) checkUrl(value, path, errors);
                else checkString(value, path, LIMITS[key === "description" ? "long" : "medium"], errors);
            });
        });

        if (isObject(data.about)) {
            checkList(data.about.paragraphs, "about.paragraphs", 12, LIMITS.long, errors);
            if (!Array.isArray(data.about.stats) || data.about.stats.length > 12) addError(errors, "about.stats", "must be a list of no more than 12 items");
            else data.about.stats.forEach(function (stat, index) {
                var path = "about.stats[" + index + "]";
                if (!checkObject(stat, path, errors)) return;
                checkString(stat.value, path + ".value", LIMITS.short, errors);
                checkString(stat.label, path + ".label", LIMITS.short, errors);
            });
        }

        function eachCollection(name, maxItems, callback) {
            if (!Array.isArray(data[name])) {
                addError(errors, name, "must be a list");
                return;
            }
            if (data[name].length > maxItems) addError(errors, name, "must contain no more than " + maxItems + " items");
            data[name].forEach(function (item, index) { callback(item, name + "[" + index + "]"); });
        }

        function collectionObject(item, path) { return checkObject(item, path, errors); }
        function text(item, key, path, max) { checkString(item[key], path + "." + key, max || LIMITS.medium, errors); }
        function url(item, key, path) { checkUrl(item[key], path + "." + key, errors); }
        function list(item, key, path, maxItems) { checkList(item[key], path + "." + key, maxItems || 40, LIMITS.listItem, errors); }

        eachCollection("projects", 50, function (item, path) {
            if (!collectionObject(item, path)) return;
            ["title", "category", "date"].forEach(function (key) { text(item, key, path); });
            text(item, "description", path, LIMITS.long); text(item, "problem", path, LIMITS.long); text(item, "implementation", path, LIMITS.long); text(item, "results", path, LIMITS.long); list(item, "tags", path, 40); url(item, "image", path); url(item, "url", path); url(item, "githubUrl", path);
        });
        eachCollection("skills", 50, function (item, path) {
            if (!collectionObject(item, path)) return;
            text(item, "category", path); text(item, "icon", path); list(item, "items", path, 50);
        });
        eachCollection("experience", 50, function (item, path) {
            if (!collectionObject(item, path)) return;
            text(item, "role", path); text(item, "company", path); text(item, "date", path); list(item, "accomplishments", path, 30); list(item, "bullets", path, 30);
        });
        eachCollection("education", 50, function (item, path) {
            if (!collectionObject(item, path)) return;
            ["period", "degree", "institution", "resultLabel", "resultValue"].forEach(function (key) { text(item, key, path); });
        });
        eachCollection("certifications", 50, function (item, path) {
            if (!collectionObject(item, path)) return;
            ["issuer", "title", "organization", "imageAlt"].forEach(function (key) { text(item, key, path); });
            url(item, "image", path); url(item, "url", path);
        });
        eachCollection("achievements", 50, function (item, path) {
            if (!collectionObject(item, path)) return;
            text(item, "eyebrow", path); text(item, "title", path); text(item, "description", path, LIMITS.long); list(item, "bullets", path, 30); url(item, "image", path); text(item, "imageAlt", path);
        });
        eachCollection("personalDetails", 30, function (item, path) {
            if (!collectionObject(item, path)) return;
            text(item, "label", path); text(item, "value", path);
        });
        if (isObject(data.contact)) {
            checkString(data.contact.email, "contact.email", LIMITS.medium, errors);
            if (data.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact.email)) addError(errors, "contact.email", "must be a valid email address");
        }
        if (isObject(data.footer)) {
            if (!Array.isArray(data.footer.links) || data.footer.links.length > 30) addError(errors, "footer.links", "must be a list of no more than 30 items");
            else data.footer.links.forEach(function (item, index) {
                var path = "footer.links[" + index + "]";
                if (!collectionObject(item, path)) return;
                text(item, "label", path); url(item, "url", path);
            });
        }
        var value = null;
        if (errors.length === 0) {
            value = clone(data);
            value.appearance = clone(appearance);
            value.resume = clone(resume);
        }
        return { valid: errors.length === 0, errors: errors, value: value };
    }

    function assertValid(data) {
        var result = validate(data);
        if (!result.valid) {
            var error = new Error("Portfolio content failed validation.");
            error.details = result.errors;
            throw error;
        }
        return result.value;
    }

    function storage() {
        try { return root.localStorage; } catch (error) { return null; }
    }

    var lastLoadError = "";
    function load() {
        lastLoadError = "";
        var store = storage();
        if (!store) return defaults();
        var raw = null;
        try { raw = store.getItem(STORAGE_KEY); } catch (error) { lastLoadError = "Unable to read local storage."; return defaults(); }
        if (!raw) return defaults();
        try {
            var parsed = JSON.parse(raw);
            var valid = validate(parsed);
            if (!valid.valid) {
                lastLoadError = "Saved content was invalid and the seed content was loaded.";
                return defaults();
            }
            return valid.value;
        } catch (error) {
            lastLoadError = "Saved content could not be read and the seed content was loaded.";
            return defaults();
        }
    }

    function save(data) {
        var value = assertValid(data);
        var store = storage();
        if (!store) throw new Error("This browser does not allow local storage.");
        store.setItem(STORAGE_KEY, JSON.stringify(value));
        return clone(value);
    }

    function reset() {
        var store = storage();
        if (store) store.removeItem(STORAGE_KEY);
        return defaults();
    }

    function exportContent(data) {
        return JSON.stringify(assertValid(data), null, 2);
    }

    function importContent(input) {
        var parsed = typeof input === "string" ? JSON.parse(input) : input;
        return assertValid(parsed);
    }

    var api = {
        schemaVersion: SCHEMA_VERSION,
        schema: clone(SCHEMA),
        storageKey: STORAGE_KEY,
        limits: clone(LIMITS),
        defaults: defaults,
        load: load,
        save: save,
        reset: reset,
        export: exportContent,
        import: importContent,
        validate: validate,
        validateSchema: validate,
        validateFieldLengths: validate,
        validateUrlSafety: validate,
        getLastLoadError: function () { return lastLoadError; }
    };

    root.ContentStore = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
}(typeof window !== "undefined" ? window : globalThis));
