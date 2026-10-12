(function () {
    "use strict";

    var state;
    var savedState;
    var dirty = false;
    var root;
    var status;
    var previewPanel;
    var importPanel;
    var importText;
    var dirtyIndicator;
    var MAX_RESUME_BYTES = 1024 * 1024;
    var SECTION_KEYS = ["about", "projects", "skills", "experience", "education", "certifications", "awards", "contact"];
    var FONT_OPTIONS = ["Inter", "Manrope", "Plus Jakarta Sans", "DM Sans", "Space Grotesk", "IBM Plex Sans", "Source Sans 3", "Public Sans", "Lora"];
    var THEME_DEFAULTS = { midnight: "#93c5fd", minimal: "#3347b0", accent: "#c0c1ff" };
    var resumeBlobUrl = "";
    var uploadToken = 0;
    var previewTimer = null;
    var authStatus;
    var authForm;
    var authEmail;
    var authPassword;
    var authSubmit;
    var authAccount;
    var authUser;
    var authHelp;
    var signOutButton;
    var protectedAdmin;
    var authenticatedUser = null;
    var authUnsubscribe = null;
    var authAttempt = 0;
    var saving = false;
    var authorized = false;
    var editorReady = false;
    var authRetry;
    var restoreDraftButton;
    var offlineDraft = null;
    var pendingPublish = false;
    var savedPendingPublish = false;

    var scalarDefinitions = {
        site: { title: "Site identity", path: "site", fields: [
            { key: "name", label: "Display name" }, { key: "title", label: "Browser title" },
            { key: "description", label: "Meta description", type: "textarea", wide: true },
            { key: "location", label: "Location" }, { key: "canonicalUrl", label: "Canonical URL", type: "url" }
        ] },
        hero: { title: "Hero content", path: "hero", fields: [
            { key: "eyebrow", label: "Eyebrow" }, { key: "title", label: "Title" }, { key: "highlight", label: "Highlight" },
            { key: "description", label: "Description", type: "textarea", wide: true },
            { key: "primaryCtaLabel", label: "Primary CTA label" }, { key: "primaryCtaHref", label: "Primary CTA URL", type: "url" },
            { key: "secondaryCtaLabel", label: "Secondary CTA label" }, { key: "secondaryCtaHref", label: "Secondary CTA URL", type: "url" },
            { key: "focusLabel", label: "Focus label" }, { key: "focusValue", label: "Focus value" }, { key: "focusSkills", label: "Focus skills" },
            { key: "basedInLabel", label: "Location label" }, { key: "basedIn", label: "Based in" }
        ] },
        about: { title: "About content", path: "about", fields: [
            { key: "eyebrow", label: "Eyebrow" }, { key: "title", label: "Title" }, { key: "highlight", label: "Highlight" },
            { key: "paragraphs", label: "Paragraphs (one per line)", type: "list", wide: true },
            { key: "image", label: "Image URL", type: "url" }, { key: "imageAlt", label: "Image alt text" }
        ] },
        contact: { title: "Contact and social", path: "contact", fields: [
            { key: "eyebrow", label: "Eyebrow" }, { key: "title", label: "Title" }, { key: "description", label: "Description", type: "textarea", wide: true },
            { key: "linkedin", label: "LinkedIn URL", type: "url" }, { key: "github", label: "GitHub URL", type: "url" },
            { key: "phone", label: "Phone" }, { key: "email", label: "Email" }, { key: "formTitle", label: "Form title" },
            { key: "formAction", label: "Form action URL", type: "url" }, { key: "formSubject", label: "Form subject" }
        ] },
        footer: { title: "Footer identity", path: "footer", fields: [
            { key: "name", label: "Name" }, { key: "copyright", label: "Copyright", type: "textarea", wide: true }
        ] }
    };

    var collections = {
        personalDetails: { title: "Personal details", path: "personalDetails", fields: [{ key: "label", label: "Label" }, { key: "value", label: "Value" }] },
        stats: { title: "About stats", path: "about.stats", fields: [{ key: "value", label: "Value" }, { key: "label", label: "Label" }] },
        education: { title: "Education entries", path: "education", fields: [{ key: "period", label: "Period" }, { key: "degree", label: "Degree" }, { key: "institution", label: "Institution", wide: true }, { key: "resultLabel", label: "Result label" }, { key: "resultValue", label: "Result value" }] },
        skills: { title: "Skill groups", path: "skills", fields: [{ key: "category", label: "Category" }, { key: "icon", label: "Icon name" }, { key: "items", label: "Skills (one per line)", type: "list", wide: true }] },
        experience: { title: "Experience entries", path: "experience", fields: [{ key: "role", label: "Role" }, { key: "company", label: "Company" }, { key: "date", label: "Date" }, { key: "accomplishments", label: "Accomplishments (one per line)", type: "list", wide: true }, { key: "bullets", label: "Legacy highlights (one per line)", type: "list", wide: true }] },
        projects: { title: "Project entries", path: "projects", fields: [{ key: "title", label: "Title" }, { key: "category", label: "Category" }, { key: "date", label: "Date" }, { key: "description", label: "Description", type: "textarea", wide: true }, { key: "problem", label: "Problem", type: "textarea", wide: true }, { key: "implementation", label: "Implementation", type: "textarea", wide: true }, { key: "results", label: "Results", type: "textarea", wide: true }, { key: "tags", label: "Tags (one per line)", type: "list", wide: true }, { key: "image", label: "Image URL", type: "url" }, { key: "url", label: "Live demo URL", type: "url" }, { key: "githubUrl", label: "GitHub URL", type: "url" }] },
        certifications: { title: "Certification entries", path: "certifications", fields: [{ key: "issuer", label: "Issuer" }, { key: "title", label: "Title" }, { key: "organization", label: "Organization" }, { key: "image", label: "Image URL", type: "url" }, { key: "imageAlt", label: "Image alt text" }, { key: "url", label: "Certificate URL", type: "url" }] },
        achievements: { title: "Achievement entries", path: "achievements", fields: [{ key: "eyebrow", label: "Eyebrow" }, { key: "title", label: "Title" }, { key: "description", label: "Description", type: "textarea", wide: true }, { key: "bullets", label: "Highlights (one per line)", type: "list", wide: true }, { key: "image", label: "Image URL", type: "url" }, { key: "imageAlt", label: "Image alt text" }] },
        footerLinks: { title: "Footer links", path: "footer.links", fields: [{ key: "label", label: "Label" }, { key: "url", label: "URL", type: "url" }] }
    };

    function make(tag, className, text) { var element = document.createElement(tag); if (className) element.className = className; if (text !== undefined) element.textContent = text; return element; }
    function clear(element) { while (element.firstChild) element.removeChild(element.firstChild); }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function getPath(object, path) { return path.split(".").reduce(function (current, key) { return current == null ? undefined : current[key]; }, object); }
    function setPath(object, path, value) { var parts = path.split("."), target = object; parts.slice(0, -1).forEach(function (key) { if (!target[key] || typeof target[key] !== "object") target[key] = {}; target = target[key]; }); target[parts[parts.length - 1]] = value; }
    function setStatus(message, errors, success) {
        clear(status); status.className = "admin-status" + (errors && errors.length ? " admin-status-error" : success ? " admin-status-success" : "");
        status.appendChild(make("span", "", message));
        if (errors && errors.length) { var list = make("ul"); errors.forEach(function (error) { list.appendChild(make("li", "", error)); }); status.appendChild(list); }
    }
    function defaultAppearance() {
        var sectionVisibility = {}; var navigationVisibility = {};
        SECTION_KEYS.forEach(function (key) { sectionVisibility[key] = true; navigationVisibility[key] = true; });
        return { theme: "midnight", headingFont: "Public Sans", bodyFont: "Inter", accentColor: THEME_DEFAULTS.midnight, radius: "sharp", animation: "subtle", heroLayout: "split", sectionVisibility: sectionVisibility, navigationVisibility: navigationVisibility };
    }
    function defaultResume() { return { fileName: "", fileSize: 0, fileType: "", dataUrl: "", downloadLabel: "Download resume", downloadUrl: "" }; }
    function normalizeState(value) {
        var next = clone(value); var appearance = defaultAppearance();
        if (next.appearance && typeof next.appearance === "object") {
            Object.keys(appearance).forEach(function (key) { if (next.appearance[key] !== undefined) appearance[key] = next.appearance[key]; });
            ["sectionVisibility", "navigationVisibility"].forEach(function (key) { appearance[key] = Object.assign({}, defaultAppearance()[key], next.appearance[key] || {}); });
        }
        next.appearance = appearance;
        next.resume = Object.assign(defaultResume(), next.resume && typeof next.resume === "object" ? next.resume : {});
        if (next.resume.dataUrl) next.resume.downloadUrl = "";
        (next.projects || []).forEach(function (project) { ["githubUrl", "problem", "implementation", "results"].forEach(function (key) { if (project[key] === undefined) project[key] = ""; }); });
        (next.experience || []).forEach(function (entry) { if (!Array.isArray(entry.accomplishments)) entry.accomplishments = []; });
        return next;
    }
    function validation(data) { return ContentStore.validate(data); }
    function maxResumeBytes() { return (ContentStore.limits && ContentStore.limits.resumeBytes) || MAX_RESUME_BYTES; }
    function fieldLimit(field) { if (field.type === "url") return ContentStore.limits.url; if (field.type === "textarea" && field.key === "description") return ContentStore.limits.long; return ContentStore.limits.medium; }
    function markDirty() {
        var wasDirty = dirty; dirty = true; updateDirtyIndicator();
        if (!wasDirty) setStatus("Unsaved changes. Select Save changes to publish them; an offline draft is kept if publishing is unavailable.");
        applyAppearance();
        schedulePreview();
    }
    function updateDirtyIndicator() { dirtyIndicator.classList.toggle("is-dirty", dirty || pendingPublish); dirtyIndicator.textContent = dirty ? "Unsaved changes" : pendingPublish ? "Draft · not published" : "Published content"; }
    function markClean() { dirty = false; updateDirtyIndicator(); }
    function renderField(parent, value, field, onChange) {
        var wrapper = make("label", "admin-field" + (field.wide ? " admin-field-wide" : "")); wrapper.appendChild(make("span", "admin-label", field.label));
        var input = make(field.type === "textarea" || field.type === "list" ? "textarea" : "input", field.type === "textarea" || field.type === "list" ? "admin-textarea" : "admin-input");
        if (field.type !== "textarea" && field.type !== "list") input.type = field.type === "url" ? "url" : "text";
        if (field.type === "list") { input.rows = Math.min(8, Math.max(3, Array.isArray(value) ? value.length + 1 : 3)); input.value = Array.isArray(value) ? value.join("\n") : ""; input.placeholder = "One item per line"; }
        else { input.value = value == null ? "" : value; input.maxLength = fieldLimit(field); if (field.type === "textarea") input.rows = 4; }
        input.addEventListener("input", function () { onChange(field.type === "list" ? input.value.split(/\r?\n/).map(function (item) { return item.trim(); }).filter(Boolean) : input.value); markDirty(); });
        wrapper.appendChild(input); parent.appendChild(wrapper);
    }
    function emptyItem(definition) { var item = {}; definition.fields.forEach(function (field) { item[field.key] = field.type === "list" ? [] : ""; }); return item; }
    function itemLabel(item, index, definition) { var preferred = item.title || item.role || item.degree || item.category || item.label || item.value || item.eyebrow; return preferred ? String(preferred) : definition.title + " " + (index + 1); }
    function subHeader(title, actionLabel, action) { var header = make("div", "admin-subsection-header"); header.appendChild(make("h3", "", title)); if (action) { var button = make("button", "admin-button", actionLabel); button.type = "button"; button.addEventListener("click", action); header.appendChild(button); } return header; }
    function renderCollection(parent, definition) {
        var section = make("div", "admin-subsection"); section.appendChild(subHeader(definition.title, "Add " + definition.title.replace(/ entries| groups| details| stats| links/gi, "").replace(/s$/, ""), function () { var items = getPath(state, definition.path); if (!Array.isArray(items)) { setPath(state, definition.path, []); items = getPath(state, definition.path); } items.push(emptyItem(definition)); renderEditor(); markDirty(); setStatus(definition.title + " item added. Fill it in and save when ready."); }));
        var list = make("div", "admin-collection"), items = getPath(state, definition.path);
        if (!Array.isArray(items) || !items.length) list.appendChild(make("p", "admin-empty", "No items yet. Add the first one."));
        (items || []).forEach(function (item, index) {
            var card = make("article", "admin-item"), header = make("div", "admin-item-header"); header.appendChild(make("h4", "admin-item-title", itemLabel(item, index, definition))); var controls = make("div", "admin-item-controls");
            [{ label: "Up", action: function () { var temp = items[index - 1]; items[index - 1] = items[index]; items[index] = temp; renderEditor(); markDirty(); } }, { label: "Down", action: function () { var temp = items[index + 1]; items[index + 1] = items[index]; items[index] = temp; renderEditor(); markDirty(); } }, { label: "Delete", danger: true, action: function () { if (!window.confirm("Delete this " + definition.title.toLowerCase().replace(/ entries| groups| details| stats| links/gi, "") + "?")) return; items.splice(index, 1); renderEditor(); markDirty(); setStatus(definition.title + " item deleted."); } }].forEach(function (control) { var button = make("button", "admin-small-button" + (control.danger ? " admin-button-danger" : ""), control.label); button.type = "button"; button.disabled = (control.label === "Up" && index === 0) || (control.label === "Down" && index === items.length - 1); button.addEventListener("click", control.action); controls.appendChild(button); });
            header.appendChild(controls); card.appendChild(header); var grid = make("div", "admin-field-grid"); definition.fields.forEach(function (field) { renderField(grid, item[field.key], field, function (next) { item[field.key] = next; }); }); card.appendChild(grid); list.appendChild(card);
        }); section.appendChild(list); parent.appendChild(section);
    }
    function renderScalar(parent, key) { var definition = scalarDefinitions[key], section = make("div", "admin-subsection"); section.appendChild(subHeader(definition.title)); var grid = make("div", "admin-field-grid"), object = getPath(state, definition.path); definition.fields.forEach(function (field) { renderField(grid, object[field.key], field, function (next) { object[field.key] = next; }); }); section.appendChild(grid); parent.appendChild(section); }
    function renderPanel(key, title) { var panel = make("section", "admin-section-panel"); panel.id = "admin-section-" + key; panel.dataset.sectionKey = key; panel.appendChild(make("h2", "", title)); return panel; }
    function renderOverview() {
        var panel = renderPanel("overview", "Overview"), grid = make("div", "admin-overview-grid"), metrics = [["Projects", state.projects.length], ["Skills", state.skills.length], ["Experience", state.experience.length], ["Education", state.education.length], ["Resume", state.resume.dataUrl ? "Ready" : "Not set"]];
        metrics.forEach(function (metric) { var card = make("div", "admin-metric"); card.appendChild(make("span", "admin-label", metric[0])); card.appendChild(make("strong", "", String(metric[1]))); grid.appendChild(card); }); panel.appendChild(grid); panel.appendChild(make("p", "admin-overview-note", "Use the navigation to edit each portfolio area. The preview reflects current in-memory edits, including changes that have not been saved yet.")); return panel;
    }
    function renderAppearance() {
        var panel = renderPanel("appearance", "Appearance"); panel.appendChild(make("p", "admin-help", "Draft changes apply to the live preview immediately and are persisted only when you select Save changes."));
        var choices = make("div", "admin-choice-grid"); [{ key: "theme", label: "Colour theme", options: ["midnight", "minimal", "accent"] }, { key: "headingFont", label: "Heading font", options: appearanceFonts("headingFont") }, { key: "bodyFont", label: "Body font", options: appearanceFonts("bodyFont") }, { key: "radius", label: "Corner radius", options: ["sharp", "soft", "rounded"] }, { key: "animation", label: "Animation", options: ["reduced", "subtle", "full"] }, { key: "heroLayout", label: "Hero layout", options: ["split", "stacked"] }].forEach(function (definition) { var label = make("label", "admin-field"); label.appendChild(make("span", "admin-label", definition.label)); var select = make("select", "admin-select"); definition.options.forEach(function (option) { var optionElement = make("option", "", option); optionElement.value = option; select.appendChild(optionElement); }); select.value = state.appearance[definition.key]; select.addEventListener("change", function () { state.appearance[definition.key] = select.value; markDirty(); }); label.appendChild(select); choices.appendChild(label); });
        var colorLabel = make("label", "admin-field"); colorLabel.appendChild(make("span", "admin-label", "Accent color")); var color = make("input", "admin-input"); color.type = "color"; color.value = state.appearance.accentColor; color.addEventListener("input", function () { state.appearance.accentColor = color.value; markDirty(); }); colorLabel.appendChild(color); choices.appendChild(colorLabel); panel.appendChild(choices);
        [["sectionVisibility", "Section visibility"], ["navigationVisibility", "Navigation visibility"]].forEach(function (group) { var area = make("div", "admin-subsection"); area.appendChild(make("h3", "", group[1])); area.appendChild(make("p", "admin-help", group[0] === "sectionVisibility" ? "Choose which public content sections are rendered." : "Choose which items are shown in the public navigation.")); var checks = make("div", "admin-check-list"); SECTION_KEYS.forEach(function (key) { var label = make("label", "admin-check"), checkbox = make("input"); checkbox.type = "checkbox"; checkbox.checked = state.appearance[group[0]][key] !== false; checkbox.addEventListener("change", function () { state.appearance[group[0]][key] = checkbox.checked; updateNavigation(); markDirty(); }); label.appendChild(checkbox); label.appendChild(make("span", "", key.charAt(0).toUpperCase() + key.slice(1))); checks.appendChild(label); }); area.appendChild(checks); panel.appendChild(area); });
        var themePreview = make("div", "admin-theme-preview"); themePreview.appendChild(make("h3", "", "Theme preview")); var themeCards = make("div", "admin-theme-grid"); [{ key: "midnight", title: "Midnight Professional", swatch: "#111827", accent: THEME_DEFAULTS.midnight }, { key: "minimal", title: "Minimal Light", swatch: "#faf8f3", accent: THEME_DEFAULTS.minimal }, { key: "accent", title: "Modern Accent", swatch: "#101827", accent: THEME_DEFAULTS.accent }].forEach(function (theme) { var card = make("button", "admin-theme-card"); card.type = "button"; card.style.backgroundColor = theme.swatch; card.style.color = theme.accent; card.appendChild(make("strong", "", theme.title)); card.appendChild(make("span", "", "Aa  /  " + theme.accent)); card.addEventListener("click", function () { state.appearance.theme = theme.key; state.appearance.accentColor = theme.accent; renderEditor(); markDirty(); goToSection("appearance"); }); themeCards.appendChild(card); }); themePreview.appendChild(themeCards); panel.appendChild(themePreview);
        var resetActions = make("div", "admin-actions"); var resetAppearance = make("button", "admin-button admin-button-secondary", "Reset appearance"); resetAppearance.id = "reset-appearance"; resetAppearance.type = "button"; resetAppearance.addEventListener("click", function () { var defaults = defaultAppearance(); state.appearance = Object.assign({}, state.appearance, defaults); renderEditor(); markDirty(); goToSection("appearance"); }); var resetTypography = make("button", "admin-button admin-button-secondary", "Reset typography"); resetTypography.id = "reset-typography"; resetTypography.type = "button"; resetTypography.addEventListener("click", function () { state.appearance.headingFont = "Public Sans"; state.appearance.bodyFont = "Inter"; renderEditor(); markDirty(); goToSection("appearance"); }); resetActions.appendChild(resetAppearance); resetActions.appendChild(resetTypography); panel.appendChild(resetActions);
        return panel;
    }
    function revokeResumePreview() { if (resumeBlobUrl) { URL.revokeObjectURL(resumeBlobUrl); resumeBlobUrl = ""; } }
    function pdfBlob(dataUrl) { var parts = dataUrl.split(","); var binary = atob(parts[1] || ""); var bytes = new Uint8Array(binary.length); for (var index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index); return new Blob([bytes], { type: "application/pdf" }); }
    function base64FromBytes(bytes) { var binary = ""; for (var index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]); return btoa(binary); }
    function acceptResumeFile(file, token, input) {
        var extensionIsPdf = /\.pdf$/i.test(file.name), mimeIsValid = !file.type || file.type === "application/pdf";
        if (!extensionIsPdf || !mimeIsValid) { input.value = ""; setStatus("Resume upload rejected.", ["Choose a PDF with a .pdf extension. A missing MIME type is accepted when the PDF header is valid."]); return; }
        if (file.size > maxResumeBytes()) { input.value = ""; setStatus("Resume upload rejected.", ["The embedded PDF must be no larger than " + formatBytes(maxResumeBytes()) + "."]); return; }
        var headerReader = new FileReader(); headerReader.onload = function () {
            if (token !== uploadToken) return;
            var bytes = new Uint8Array(headerReader.result || []), header = ""; for (var index = 0; index < Math.min(bytes.length, 5); index += 1) header += String.fromCharCode(bytes[index]);
            if (header !== "%PDF-") { input.value = ""; setStatus("Resume upload rejected.", ["The selected file does not have a valid %PDF- header."]); return; }
            var reader = new FileReader(); reader.onload = function () {
                if (token !== uploadToken) return;
                var dataUrl = "data:application/pdf;base64," + base64FromBytes(new Uint8Array(reader.result || [])); if (!/^data:application\/pdf;base64,[A-Za-z0-9+/=]+$/.test(dataUrl)) { setStatus("Resume upload rejected.", ["The selected file could not be read as a PDF."]); return; }
                state.resume = { fileName: file.name, fileSize: file.size, fileType: "application/pdf", dataUrl: dataUrl, downloadLabel: state.resume.downloadLabel || "Download resume", downloadUrl: "" };
                renderEditor(); markDirty(); setStatus("Resume selected. Save changes to publish this PDF with the shared content.");
            }; reader.onerror = function () { if (token === uploadToken) setStatus("Resume upload rejected.", ["The selected file could not be read."]); }; reader.readAsArrayBuffer(file);
        }; headerReader.onerror = function () { if (token === uploadToken) setStatus("Resume upload rejected.", ["The selected file header could not be read."]); }; headerReader.readAsArrayBuffer(file.slice(0, 5));
    }
    function renderResume() {
        revokeResumePreview();
        var panel = renderPanel("resume", "Resume"), fileArea = make("div", "admin-file"); fileArea.appendChild(make("strong", "admin-notice", "PDF / shared metadata")); fileArea.appendChild(make("p", "admin-help", "Structured resume metadata and a validated embedded PDF are included when the shared content is published. Embedded PDFs are limited to " + formatBytes(maxResumeBytes()) + "; use a committed relative URL or HTTPS URL when a separate public asset is preferred.")); var input = make("input"); input.type = "file"; input.accept = ".pdf,application/pdf"; input.setAttribute("aria-label", "Choose a PDF resume"); input.addEventListener("change", function () { var file = input.files && input.files[0]; if (!file) return; uploadToken += 1; acceptResumeFile(file, uploadToken, input); }); fileArea.appendChild(input); panel.appendChild(fileArea);
        var resume = state.resume; if (resume.dataUrl) { var info = make("div", "admin-file-info"); info.appendChild(make("strong", "", resume.fileName)); info.appendChild(make("span", "", formatBytes(resume.fileSize) + " · " + (resume.fileType || "application/pdf"))); var frame = make("iframe", "admin-file-preview"); frame.sandbox = "allow-scripts"; frame.src = resumeBlobUrl = URL.createObjectURL(pdfBlob(resume.dataUrl)); frame.title = "Resume PDF preview"; info.appendChild(frame); var link = make("a", "admin-file-link", resume.downloadLabel || "Download resume"); link.href = resumeBlobUrl; link.download = resume.fileName || "resume.pdf"; link.target = "_blank"; link.rel = "noopener"; info.appendChild(link); var remove = make("button", "admin-button admin-button-danger", "Remove uploaded PDF"); remove.type = "button"; remove.addEventListener("click", function () { if (!window.confirm("Remove the uploaded PDF from this draft?")) return; uploadToken += 1; state.resume = Object.assign(defaultResume(), { downloadLabel: resume.downloadLabel || "Download resume" }); renderEditor(); markDirty(); setStatus("Uploaded PDF removed. A published download URL can now be entered."); }); info.appendChild(remove); panel.appendChild(info); } else panel.appendChild(make("p", "admin-empty", "No uploaded PDF. Structured resume content remains independent of this file."));
        var fields = make("div", "admin-subsection"); fields.appendChild(make("h3", "", "Structured resume download settings")); fields.appendChild(make("p", "admin-help", "Use a committed relative path such as asset/resume.pdf or a safe HTTPS URL for a published resume. Embedded PDFs intentionally keep downloadUrl empty to avoid duplicating base64 data.")); var fieldGrid = make("div", "admin-field-grid"); renderField(fieldGrid, resume.downloadLabel, { key: "downloadLabel", label: "Download label" }, function (next) { state.resume.downloadLabel = next; }); if (!resume.dataUrl) renderField(fieldGrid, resume.downloadUrl, { key: "downloadUrl", label: "Published resume URL", type: "url" }, function (next) { state.resume.downloadUrl = next; }); else fieldGrid.appendChild(make("p", "admin-help", "Published resume URL is enabled after removing the uploaded PDF.")); fields.appendChild(fieldGrid); panel.appendChild(fields); return panel;
    }
    function renderEditor() {
        clear(root); root.appendChild(renderOverview()); var profile = renderPanel("profile", "Profile"); renderScalar(profile, "site"); renderScalar(profile, "hero"); renderCollection(profile, collections.personalDetails); root.appendChild(profile);
        var about = renderPanel("about", "About"); renderScalar(about, "about"); renderCollection(about, collections.stats); root.appendChild(about);
        ["education", "skills", "experience", "projects", "certifications", "achievements"].forEach(function (key) { var panel = renderPanel(key, collections[key].title); renderCollection(panel, collections[key]); root.appendChild(panel); });
        var social = renderPanel("social", "Social"); renderScalar(social, "contact"); renderScalar(social, "footer"); renderCollection(social, collections.footerLinks); root.appendChild(social); root.appendChild(renderResume()); root.appendChild(renderAppearance()); updateNavigation();
    }
    function formatBytes(bytes) { if (!bytes) return "0 bytes"; if (bytes < 1024) return bytes + " bytes"; if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"; return (bytes / (1024 * 1024)).toFixed(2) + " MB"; }
    function appearanceFonts(key) { var options = ContentStore.schema && ContentStore.schema.appearanceOptions && ContentStore.schema.appearanceOptions[key]; return options && options.length ? options.slice() : FONT_OPTIONS.slice(); }
    function applyAppearance() { if (window.PortfolioAppearance && typeof window.PortfolioAppearance.apply === "function") window.PortfolioAppearance.apply(state.appearance); }
    function updateNavigation() { /* Admin navigation is always available; public visibility is independent. */ }
    function sendPreview() { if (!authorized || !editorReady || !state) return; var result = validation(state); if (!result.valid) return; var frame = document.getElementById("public-preview-frame"); if (!frame || !frame.contentWindow || frame.getAttribute("src") === "about:blank") return; frame.contentWindow.postMessage({ type: "portfolio:preview", content: result.value }, location.origin); }
    function schedulePreview() { if (previewTimer) window.clearTimeout(previewTimer); previewTimer = window.setTimeout(function () { previewTimer = null; sendPreview(); }, 200); }
    function goToSection(key) { var target = document.getElementById("admin-section-" + key); if (!target) return; document.querySelectorAll(".admin-nav-button").forEach(function (button) { button.classList.toggle("is-active", button.getAttribute("data-section-target") === key); }); target.scrollIntoView({ behavior: "smooth", block: "start" }); }
    function setAuthStatus(message, errors, success) {
        clear(authStatus); authStatus.className = "admin-status" + (errors && errors.length ? " admin-status-error" : success ? " admin-status-success" : "");
        authStatus.appendChild(make("span", "", message));
        if (errors && errors.length) { var list = make("ul"); errors.forEach(function (error) { list.appendChild(make("li", "", error)); }); authStatus.appendChild(list); }
    }
    function setAuthMode(mode) {
        authForm.classList.toggle("admin-hidden", mode !== "login");
        authAccount.classList.toggle("admin-hidden", mode !== "account");
        if (mode === "login") authHelp.textContent = "Use the email and password for an account that has been added to public.portfolio_admins.";
        if (mode === "account") authHelp.textContent = "Shared saves are protected by Supabase Row Level Security. Sign out when you are finished.";
    }
    function showProtectedEditor(show) { protectedAdmin.classList.toggle("admin-hidden", !show); }
    function userLabel(user) { return user && (user.email || user.id) ? (user.email || user.id) : "authenticated user"; }
    function loadInitialState() {
        var loaded = normalizeState(ContentStore.load()), result = validation(loaded);
        if (!result.valid) return { state: normalizeState(ContentStore.defaults()), warning: "Saved content failed ContentStore validation, so seed content was loaded." };
        return { state: loaded, warning: ContentStore.getLastLoadError() };
    }
    function readOfflineDraft() {
        try {
            var raw = window.localStorage.getItem(ContentStore.storageKey);
            if (!raw) return null;
            var result = validation(JSON.parse(raw));
            return result.valid ? normalizeState(result.value) : null;
        } catch (error) { return null; }
    }
    function clearOfflineDraft() {
        try { ContentStore.reset(); } catch (error) { /* A remote publish is still valid if browser storage is unavailable. */ }
        offlineDraft = null;
        restoreDraftButton.classList.add("admin-hidden");
    }
    function updateRestoreDraftButton() {
        restoreDraftButton.classList.toggle("admin-hidden", !offlineDraft || !editorReady || pendingPublish);
    }
    function setPreviewFrame(active) {
        var frame = document.getElementById("public-preview-frame");
        if (!frame) return;
        frame.setAttribute("src", active ? (frame.getAttribute("data-preview-src") || "index.html?preview=1") : "about:blank");
    }
    function installEditorState(next, isPending) {
        uploadToken += 1; state = normalizeState(next); savedState = clone(state); savedPendingPublish = !!isPending; pendingPublish = !!isPending; dirty = false; editorReady = true; renderEditor(); applyAppearance(); updateDirtyIndicator(); updateRestoreDraftButton(); schedulePreview();
    }
    function publishedState(record) {
        if (!record || !record.content) return null;
        var result = validation(record.content);
        if (!result.valid) { var error = new Error("The published portfolio content failed validation."); error.details = result.errors; throw error; }
        return normalizeState(result.value);
    }
    function loadRemoteEditor(attempt) {
        setPreviewFrame(true);
        var offline = loadInitialState();
        offlineDraft = readOfflineDraft();
        return window.PortfolioSupabase.loadPublishedContent().then(function (record) {
            if (attempt !== authAttempt || !authenticatedUser) return;
            var remote = publishedState(record);
            if (remote) {
                installEditorState(remote, false);
                showProtectedEditor(true);
                updateRestoreDraftButton();
                setStatus("Loaded the published shared portfolio. Edit a section and publish when ready.", null, true);
                authHelp.textContent = "Published shared content is loaded. Changes remain drafts until you select Save changes.";
            } else {
                installEditorState(offlineDraft || offline.state, true);
                showProtectedEditor(true);
                setStatus(offlineDraft ? "No shared content has been published yet. A validated offline draft was loaded." : "No shared content has been published yet. Seed content was loaded.", offline.warning ? [offline.warning] : null, !offline.warning);
                authHelp.textContent = "The shared row is empty. Save changes to publish this editor state.";
            }
        }).catch(function (error) {
            if (attempt !== authAttempt || !authenticatedUser) return;
            installEditorState(offlineDraft || offline.state, true);
            showProtectedEditor(true);
            var errors = [error && error.message ? error.message : "The shared content could not be loaded."];
            if (offline.warning) errors.push(offline.warning);
            setStatus("Supabase content is unavailable. Working from an offline draft; saves will be kept locally until the connection returns.", errors);
            authHelp.textContent = "Offline draft mode is active. Reconnect and select Save changes to publish the draft.";
        });
    }
    function save() {
        if (saving) return;
        if (!authenticatedUser || !authorized) { setStatus("Sign in with an allow-listed administrator account before publishing changes.", ["Your Supabase session is not authorized for portfolio publishing."]); return; }
        var result = validation(state);
        if (!result.valid) { setStatus("Changes could not be saved.", result.errors); return; }
        var saveAttempt = authAttempt;
        saving = true;
        var saveButton = document.getElementById("save-button");
        if (saveButton) saveButton.disabled = true;
        setStatus("Publishing shared content…");
        window.PortfolioSupabase.savePublishedContent(result.value, ContentStore.schemaVersion).then(function () {
            if (saveAttempt !== authAttempt || !authenticatedUser || !authorized) return;
            state = normalizeState(result.value); savedState = clone(state); savedPendingPublish = false; pendingPublish = false; markClean(); clearOfflineDraft();
            setStatus("Changes published to the shared portfolio.", null, true);
            authHelp.textContent = "The latest validated content is published in Supabase for the portfolio to load.";
        }).catch(function (error) {
            if (saveAttempt !== authAttempt || !authenticatedUser || !authorized) return;
            try {
                state = normalizeState(ContentStore.save(result.value)); savedState = clone(state); savedPendingPublish = true; pendingPublish = true; offlineDraft = clone(state); markClean(); updateRestoreDraftButton();
                setStatus("Shared publishing failed; the validated changes were saved as an offline draft.", [error && error.message ? error.message : "Supabase is unavailable." ]);
                authHelp.textContent = "Offline draft mode is active. Retry Save changes when Supabase is available.";
            } catch (offlineError) {
                setStatus("Changes could not be published or saved offline.", [error && error.message ? error.message : "Supabase is unavailable.", offlineError.message || "Local storage is unavailable."]);
            }
        }).then(function () {
            saving = false;
            if (saveButton) saveButton.disabled = false;
        });
    }
    function cancel() { if (!dirty) { setStatus("There are no unsaved changes."); return; } if (!window.confirm("Discard all unsaved changes?")) return; uploadToken += 1; state = clone(savedState); pendingPublish = savedPendingPublish; renderEditor(); markClean(); updateRestoreDraftButton(); setStatus("Unsaved changes discarded.", null, true); }
    function reset() { if (!window.confirm("Reset this editor to the seeded portfolio content? The currently published shared row will remain unchanged until you publish again.")) return; uploadToken += 1; try { state = normalizeState(ContentStore.defaults()); dirty = true; pendingPublish = true; renderEditor(); updateDirtyIndicator(); updateRestoreDraftButton(); setStatus("Draft reset to the seeded portfolio. Publish again if this should become shared content.", null, true); } catch (error) { setStatus(error.message || "Content could not be reset.", error.details || []); } }
    function restoreDraft() { if (!offlineDraft || !editorReady) return; uploadToken += 1; state = clone(offlineDraft); dirty = true; pendingPublish = true; renderEditor(); updateDirtyIndicator(); updateRestoreDraftButton(); setStatus("Offline draft restored. Select Save changes to publish it.", null, true); }
    function exportJson() { var result = validation(state); if (!result.valid) { setStatus("The current model cannot be exported.", result.errors); return; } try { var json = ContentStore.export(result.value); importText.value = json; var blob = new Blob([json], { type: "application/json" }); var url = URL.createObjectURL(blob); var link = document.createElement("a"); link.href = url; link.download = "portfolio-content-v" + ContentStore.schemaVersion + ".json"; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); setStatus("JSON exported. Keep the downloaded file as a backup.", null, true); } catch (error) { setStatus(error.message || "The current content could not be exported.", error.details || []); } }
    function importJson() { try { uploadToken += 1; state = normalizeState(ContentStore.import(importText.value)); renderEditor(); markDirty(); importPanel.classList.add("admin-hidden"); setStatus("JSON loaded into the editor. Save changes to publish it.", null, true); } catch (error) { setStatus(error.message || "JSON could not be loaded.", error.details || ["Check that the JSON is a valid portfolio export."]); } }
    function clearEditorAccess() { authAttempt += 1; authenticatedUser = null; authorized = false; editorReady = false; pendingPublish = false; savedPendingPublish = false; offlineDraft = null; restoreDraftButton.classList.add("admin-hidden"); previewPanel.classList.add("admin-hidden"); setPreviewFrame(false); showProtectedEditor(false); }
    function handleSession(session) {
        if (session && session.user && authenticatedUser && authenticatedUser.id === session.user.id && authorized) return Promise.resolve();
        var attempt = ++authAttempt;
        if (!session || !session.user) {
            clearEditorAccess(); setAuthMode("login"); setAuthRetryVisible(false); setAuthStatus("Sign in to open the shared portfolio editor.");
            return Promise.resolve();
        }
        authenticatedUser = session.user; authorized = false; editorReady = false; pendingPublish = false; savedPendingPublish = false; offlineDraft = null; restoreDraftButton.classList.add("admin-hidden"); authUser.textContent = userLabel(session.user); setAuthMode("account"); setPreviewFrame(false); showProtectedEditor(false); setAuthStatus("Checking administrator allow-list…");
        return window.PortfolioSupabase.isAdmin(session.user).then(function (allowed) {
            if (attempt !== authAttempt || !authenticatedUser) return;
            if (!allowed) {
                editorReady = false; showProtectedEditor(false); setAuthStatus("This account is authenticated but is not allow-listed for portfolio publishing.", ["Add user ID " + session.user.id + " to public.portfolio_admins in Supabase, then sign in again."]); authHelp.textContent = "The database allow-list controls publishing access; authentication alone is not sufficient."; setAuthRetryVisible(true); return;
            }
            authorized = true; setAuthStatus("Administrator access verified. Loading shared content…", null, true); setAuthRetryVisible(false); return loadRemoteEditor(attempt);
        }).catch(function (error) {
            if (attempt !== authAttempt) return;
            editorReady = false; showProtectedEditor(false); setPreviewFrame(false); setAuthStatus("Administrator access could not be verified.", [error && error.message ? error.message : "Check the Supabase schema and Row Level Security policies."]); authHelp.textContent = "The editor stays locked until the authenticated user can be checked against public.portfolio_admins."; setAuthRetryVisible(true);
        });
    }
    function signIn(event) {
        event.preventDefault();
        var email = authEmail.value.trim(), password = authPassword.value;
        if (!email || !password) { setAuthStatus("Sign-in needs both fields.", ["Enter the administrator email and password."]); return; }
        authSubmit.disabled = true; setAuthStatus("Signing in…");
        window.PortfolioSupabase.signIn(email, password).then(function (data) { authPassword.value = ""; return handleSession(data && data.session); }).catch(function (error) { setAuthStatus("Sign-in failed.", [error && error.message ? error.message : "Check the credentials and Supabase Auth configuration."]); }).then(function () { authSubmit.disabled = false; });
    }
    function signOut() {
        if (dirty && !window.confirm("You have unsaved changes. Sign out and discard them?")) return;
        signOutButton.disabled = true; setAuthStatus("Signing out…");
        window.PortfolioSupabase.signOut().then(function () { clearEditorAccess(); setAuthMode("login"); setAuthRetryVisible(false); setAuthStatus("Signed out.", null, true); }).catch(function (error) { setAuthStatus("Sign-out failed.", [error && error.message ? error.message : "The Supabase session could not be closed."]); }).then(function () { signOutButton.disabled = false; });
    }
    function setAuthRetryVisible(visible) { authRetry.classList.toggle("admin-hidden", !visible); authRetry.disabled = false; }
    function retryAuth() { authRetry.disabled = true; setAuthStatus("Retrying Supabase connection and access check…"); initializeAuth(true); }
    function initializeAuth(retry) {
        if (!window.PortfolioSupabase) { setAuthMode("locked"); setAuthStatus("Supabase client is unavailable.", ["Load supabase-client.js before the editor."]); setAuthRetryVisible(true); return; }
        if (authUnsubscribe) { authUnsubscribe(); authUnsubscribe = null; }
        var ready = retry && typeof window.PortfolioSupabase.retry === "function" ? window.PortfolioSupabase.retry() : window.PortfolioSupabase.ready();
        ready.then(function (result) {
            if (!result.configured || !result.available) { setAuthMode("locked"); setAuthStatus("Supabase setup is required before /admin can open.", [result.message, "Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel, then redeploy."]); authHelp.textContent = "The editor remains locked until the public Supabase URL and anon key can be loaded from /api/config."; setAuthRetryVisible(true); return null; }
            setAuthRetryVisible(false);
            setAuthStatus("Checking the current Supabase session…");
            return window.PortfolioSupabase.onAuthStateChange(function (event, session) { handleSession(session); }).then(function (unsubscribe) { authUnsubscribe = unsubscribe; return window.PortfolioSupabase.getSession(); }).then(handleSession);
        }).catch(function (error) { setAuthMode("locked"); setAuthStatus("Supabase could not initialize.", [error && error.message ? error.message : "Check the deployment configuration."]); authHelp.textContent = "The editor remains locked until Supabase configuration and the browser SDK are available."; setAuthRetryVisible(true); });
    }
    function init() {
        root = document.getElementById("editor-root"); status = document.getElementById("status"); previewPanel = document.getElementById("preview-panel"); importPanel = document.getElementById("import-panel"); importText = document.getElementById("import-json"); dirtyIndicator = document.getElementById("dirty-indicator");
        authStatus = document.getElementById("auth-status"); authForm = document.getElementById("auth-form"); authEmail = document.getElementById("auth-email"); authPassword = document.getElementById("auth-password"); authSubmit = document.getElementById("auth-submit"); authAccount = document.getElementById("auth-account"); authUser = document.getElementById("auth-user"); authHelp = document.getElementById("auth-help"); signOutButton = document.getElementById("sign-out-button"); protectedAdmin = document.getElementById("protected-admin"); authRetry = document.getElementById("auth-retry"); restoreDraftButton = document.getElementById("restore-draft-button");
        var frame = document.getElementById("public-preview-frame");
        if (frame) { frame.addEventListener("load", function () { sendPreview(); }); window.addEventListener("message", function (event) { if (event.origin !== location.origin || event.source !== frame.contentWindow || !event.data || event.data.type !== "portfolio:preview-ready") return; sendPreview(); }); }
        document.getElementById("storage-key-label").textContent = ContentStore.storageKey;
        document.getElementById("editor-form").addEventListener("submit", function (event) { event.preventDefault(); save(); }); document.getElementById("save-button").addEventListener("click", save); document.getElementById("cancel-button").addEventListener("click", cancel); document.getElementById("reset-button").addEventListener("click", reset); document.getElementById("preview-button").addEventListener("click", function () { previewPanel.classList.remove("admin-hidden"); previewPanel.scrollIntoView({ behavior: "smooth", block: "start" }); sendPreview(); }); document.getElementById("close-preview").addEventListener("click", function () { previewPanel.classList.add("admin-hidden"); }); document.getElementById("export-button").addEventListener("click", exportJson); document.getElementById("import-toggle").addEventListener("click", function () { importPanel.classList.toggle("admin-hidden"); if (!importPanel.classList.contains("admin-hidden")) importText.focus(); }); document.getElementById("import-button").addEventListener("click", importJson); document.querySelectorAll("[data-section-target]").forEach(function (button) { button.addEventListener("click", function () { goToSection(button.getAttribute("data-section-target")); }); });
        authForm.addEventListener("submit", signIn); signOutButton.addEventListener("click", signOut); authRetry.addEventListener("click", retryAuth); restoreDraftButton.addEventListener("click", restoreDraft); setAuthMode("login"); setAuthRetryVisible(false); showProtectedEditor(false); initializeAuth(false);
        window.addEventListener("beforeunload", function (event) { revokeResumePreview(); if (authUnsubscribe) authUnsubscribe(); if (!dirty) return; event.preventDefault(); event.returnValue = ""; });
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
}());
