(function (window, document) {
    "use strict";

    var fonts = [
        "Public Sans", "Inter", "Manrope", "Plus Jakarta Sans", "DM Sans",
        "Space Grotesk", "IBM Plex Sans", "Source Sans 3", "Lora"
    ];
    var themes = {
        midnight: { accent: "#93c5fd", surface: "#0b1220" },
        minimal: { accent: "#3347b0", surface: "#fbfaf7" },
        accent: { accent: "#c0c1ff", surface: "#101028" }
    };
    var fallback = {
        theme: "midnight", headingFont: "Public Sans", bodyFont: "Inter",
        radius: "sharp", animation: "subtle", heroLayout: "split"
    };

    function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

    function hexToRgb(value) {
        var match = /^#?([0-9a-f]{6})$/i.exec(String(value || ""));
        if (!match) return null;
        return [parseInt(match[1].slice(0, 2), 16), parseInt(match[1].slice(2, 4), 16), parseInt(match[1].slice(4, 6), 16)];
    }

    function rgbToHex(rgb) {
        return "#" + rgb.map(function (channel) { return clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"); }).join("");
    }

    function relativeLuminance(rgb) {
        var converted = rgb.map(function (channel) {
            var value = channel / 255;
            return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * converted[0] + 0.7152 * converted[1] + 0.0722 * converted[2];
    }

    function contrast(first, second) {
        var light = Math.max(relativeLuminance(first), relativeLuminance(second));
        var dark = Math.min(relativeLuminance(first), relativeLuminance(second));
        return (light + 0.05) / (dark + 0.05);
    }

    function mix(rgb, target, amount) {
        return rgb.map(function (channel, index) { return channel + (target[index] - channel) * amount; });
    }

    /* Find the nearest shade on either end of the colour scale that remains
       readable against the theme surface. */
    function readableAccent(value, surface) {
        var accent = hexToRgb(value) || hexToRgb(surface.accent);
        var base = hexToRgb(surface.surface);
        if (!accent || !base) return surface.accent;
        if (contrast(accent, base) >= 4.5) return rgbToHex(accent);
        var candidates = [];
        [[0, 0, 0], [255, 255, 255]].forEach(function (target) {
            for (var step = 1; step <= 100; step += 1) {
                var amount = step / 100;
                var candidate = mix(accent, target, amount);
                if (contrast(candidate, base) >= 4.5) {
                    candidates.push({ amount: amount, rgb: candidate });
                    break;
                }
            }
        });
        if (!candidates.length) return contrast([0, 0, 0], base) >= contrast([255, 255, 255], base) ? "#000000" : "#ffffff";
        candidates.sort(function (left, right) { return left.amount - right.amount; });
        return rgbToHex(candidates[0].rgb);
    }

    function fontValue(value, defaultValue) {
        var selected = fonts.indexOf(value) === -1 ? defaultValue : value;
        return '"' + selected.replace(/"/g, "") + '", sans-serif';
    }

    function setRgbVariables(root, accent) {
        var rgb = hexToRgb(accent);
        if (!rgb) return;
        root.style.setProperty("--accent-rgb", rgb.join(" "));
        root.style.setProperty("--theme-accent", accent);
        root.style.setProperty("--accent", accent);
        var ink = contrast(rgb, [0, 0, 0]) >= contrast(rgb, [255, 255, 255]) ? "#000000" : "#ffffff";
        root.style.setProperty("--accent-ink", ink);
        root.style.setProperty("--accent-ink-rgb", ink === "#000000" ? "0 0 0" : "255 255 255");
    }

    function updateFontLink(headingFont, bodyFont) {
        var selected = [];
        [headingFont, bodyFont].forEach(function (font) { if (selected.indexOf(font) === -1) selected.push(font); });
        var href = "https://fonts.googleapis.com/css2?" + selected.map(function (font) {
            return "family=" + encodeURIComponent(font).replace(/%20/g, "+") + ":wght@400;500;600;700;800;900";
        }).join("&") + "&display=swap";
        var oldCatalog = document.querySelectorAll('link[href*="fonts.googleapis.com"]:not(#portfolio-fonts)');
        Array.prototype.forEach.call(oldCatalog, function (link) {
            if (!/Material\+Symbols/i.test(link.href) && !/Material%20Symbols/i.test(link.href)) link.remove();
        });
        var link = document.getElementById("portfolio-fonts");
        if (!link) {
            link = document.createElement("link");
            link.id = "portfolio-fonts";
            link.rel = "stylesheet";
            document.head.appendChild(link);
        }
        if (link.href !== href) link.href = href;
    }

    function apply(appearance) {
        var value = appearance && typeof appearance === "object" ? appearance : {};
        var themeName = themes[value.theme] ? value.theme : fallback.theme;
        var theme = themes[themeName];
        var headingFont = fonts.indexOf(value.headingFont) === -1 ? fallback.headingFont : value.headingFont;
        var bodyFont = fonts.indexOf(value.bodyFont) === -1 ? fallback.bodyFont : value.bodyFont;
        var root = document.documentElement;
        var accent = readableAccent(/^#[0-9a-f]{6}$/i.test(value.accentColor || "") ? value.accentColor : theme.accent, theme);

        root.dataset.theme = themeName;
        root.dataset.radius = ["sharp", "soft", "rounded"].indexOf(value.radius) === -1 ? fallback.radius : value.radius;
        root.dataset.animation = ["reduced", "subtle", "full"].indexOf(value.animation) === -1 ? fallback.animation : value.animation;
        root.dataset.heroLayout = ["split", "stacked"].indexOf(value.heroLayout) === -1 ? fallback.heroLayout : value.heroLayout;
        root.style.setProperty("--heading-font", fontValue(headingFont, fallback.headingFont));
        root.style.setProperty("--body-font", fontValue(bodyFont, fallback.bodyFont));
        setRgbVariables(root, accent);
        updateFontLink(headingFont, bodyFont);
        return { theme: themeName, accent: accent, headingFont: headingFont, bodyFont: bodyFont };
    }

    window.PortfolioAppearance = Object.freeze({ apply: apply, fonts: fonts.slice(), themes: themes });
}(window, document));
