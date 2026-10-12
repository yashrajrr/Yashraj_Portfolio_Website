(function () {
    "use strict";

    var content;
    var navItems = [
        ["Home", "#home", "home"], ["About", "#about", "about"], ["Projects", "#projects", "projects"], ["Skills", "#skills", "skills"],
        ["Experience", "#experience", "experience"], ["Education", "#education", "education"], ["Certifications", "#certifications", "certifications"],
        ["Achievements", "#awards", "awards"], ["Contact", "#contact", "contact"]
    ];

    var revealState = { observer: null, motionMedia: null, motionListener: null };
    var navigationState = { sections: [], scrollHandler: null, resizeHandler: null, anchorClickHandler: null, frame: 0 };
    var scrollChromeState = { progress: null, scrollHandler: null, resizeHandler: null, frame: 0 };

    function make(tag, className, text) {
        var element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined && text !== null) element.textContent = String(text);
        return element;
    }

    function clear(element) {
        while (element && element.firstChild) element.removeChild(element.firstChild);
    }

    function eachNode(nodes, callback) {
        Array.prototype.forEach.call(nodes || [], callback);
    }

    function isHidden(element) {
        return !element || element.hidden || !!(element.closest && element.closest("[hidden]"));
    }

    function requestFrame(callback) {
        if (window.requestAnimationFrame) return window.requestAnimationFrame(callback);
        return window.setTimeout(callback, 16);
    }

    function prefersReducedMotion() {
        var configured = (document.documentElement.dataset.animation || document.body.dataset.animation) === "reduced";
        var system = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        return configured || !!system;
    }

    function makeImageFallback(label, state) {
        var fallback = make("div", "image-fallback");
        var kicker = make("span", "image-fallback__kicker", "VISUAL ASSET");
        var title = make("strong", "image-fallback__title", label || "Portfolio image");
        var status = make("span", "image-fallback__status", state || "Preview unavailable");
        fallback.appendChild(kicker);
        fallback.appendChild(title);
        fallback.appendChild(status);
        return fallback;
    }

    function setImageState(frame, source, alt, fallbackLabel) {
        if (!frame) return null;
        var image = frame.querySelector("img");
        if (!image) {
            image = make("img", "portfolio-image");
            frame.appendChild(image);
        }
        image.classList.add("portfolio-image");
        image.classList.remove("hidden");
        image.loading = "lazy";
        image.decoding = "async";
        image.setAttribute("loading", "lazy");
        image.setAttribute("decoding", "async");

        var fallback = frame.querySelector(".image-fallback");
        if (!fallback) {
            fallback = makeImageFallback(fallbackLabel, "Preview unavailable");
            frame.appendChild(fallback);
        }
        fallback.querySelector(".image-fallback__title").textContent = fallbackLabel || "Portfolio image";
        fallback.setAttribute("role", "img");
        fallback.setAttribute("aria-label", (fallbackLabel || "Portfolio image") + " — " + (source ? "image unavailable" : "no image provided"));
        fallback.hidden = !!source;

        frame.classList.add("portfolio-media");
        frame.dataset.imageState = source ? "loading" : "empty";
        frame.setAttribute("aria-busy", source ? "true" : "false");
        image.onload = function () {
            if (!source || !image.naturalWidth) return;
            frame.dataset.imageState = "ready";
            frame.classList.remove("image-frame--error");
            frame.setAttribute("aria-busy", "false");
            image.hidden = false;
            image.removeAttribute("aria-hidden");
            image.alt = alt || fallbackLabel || "Portfolio image";
            fallback.hidden = true;
        };
        image.onerror = function () {
            if (!source) return;
            frame.dataset.imageState = "error";
            frame.classList.add("image-frame--error");
            frame.setAttribute("aria-busy", "false");
            image.hidden = true;
            image.alt = "";
            image.setAttribute("aria-hidden", "true");
            fallback.hidden = false;
            fallback.setAttribute("aria-label", (fallbackLabel || "Portfolio image") + " — image unavailable");
            var status = fallback.querySelector(".image-fallback__status");
            if (status) status.textContent = "Image unavailable";
        };

        if (source) {
            image.hidden = false;
            image.removeAttribute("aria-hidden");
            image.alt = alt || fallbackLabel || "Portfolio image";
            image.src = source;
            if (image.complete && image.naturalWidth) image.onload();
        } else {
            image.hidden = true;
            image.alt = "";
            image.setAttribute("aria-hidden", "true");
            image.removeAttribute("src");
            var emptyStatus = fallback.querySelector(".image-fallback__status");
            if (emptyStatus) emptyStatus.textContent = "No preview added yet";
        }
        return image;
    }

    function setText(id, value) {
        var element = document.getElementById(id);
        if (element) element.textContent = value == null ? "" : String(value);
    }

    function setLink(id, label, href) {
        var link = document.getElementById(id);
        if (!link) return;
        link.classList.add("portfolio-cta");
        link.textContent = label || "";
        link.href = href || "#";
        if (!href) link.classList.add("hidden"); else link.classList.remove("hidden");
    }

    function setDownloadLink(id, label, href, fileName) {
        var link = document.getElementById(id);
        if (!link) return;
        link.classList.add("portfolio-cta");
        link.textContent = label || "Download resume";
        link.href = href || "#";
        link.download = fileName || "";
        link.classList.toggle("hidden", !href);
    }

    function setExternalLink(link, label, href) {
        link.classList.add("portfolio-link");
        link.textContent = label || "";
        link.href = href || "#";
        if (/^https?:/i.test(href || "")) {
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        }
    }

    function renderNavigation() {
        var nav = document.getElementById("desktop-nav");
        clear(nav);
        navItems.forEach(function (item) {
            var appearance = content.appearance || {};
            var visible = item[2] === "home" || ((appearance.navigationVisibility || {})[item[2]] !== false && (appearance.sectionVisibility || {})[item[2]] !== false);
            var link = make("a", "nav-link portfolio-nav-link border-b-4 pb-1 font-['Public_Sans'] font-black tracking-tighter uppercase text-sm transition-all duration-300", item[0]);
            link.href = item[1];
            link.hidden = !visible;
            nav.appendChild(link);
        });
        var name = content.site.name.replace(/\s+/g, "_");
        setText("nav-name", name);
    }

    function renderHero() {
        var hero = content.hero;
        setText("hero-eyebrow", hero.eyebrow);
        setText("hero-title", hero.title);
        setText("hero-highlight", hero.highlight);
        setText("hero-description", hero.description);
        setLink("hero-primary-cta", hero.primaryCtaLabel, hero.primaryCtaHref);
        setLink("hero-secondary-cta", hero.secondaryCtaLabel, hero.secondaryCtaHref);
        var resume = content.resume || {};
        setDownloadLink("hero-resume-cta", resume.downloadLabel, resume.downloadUrl || resume.dataUrl, resume.fileName || "resume.pdf");
        setText("hero-focus-label", hero.focusLabel);
        setText("hero-focus-value", hero.focusValue);
        setText("hero-focus-skills", hero.focusSkills);
        setText("hero-based-label", hero.basedInLabel);
        setText("hero-based", hero.basedIn);
    }

    function renderAbout() {
        var about = content.about;
        setText("about-eyebrow", about.eyebrow);
        setText("about-title", about.title);
        setText("about-highlight", about.highlight);
        var image = document.getElementById("about-image");
        if (image) {
            var frame = image.parentElement;
            if (frame) {
                frame.classList.add("portfolio-media", "portfolio-media--about");
                var overlay = frame.querySelector(".absolute.inset-0");
                if (overlay) overlay.classList.add("portfolio-media-overlay");
                setImageState(frame, about.image, about.imageAlt || "Portrait of " + content.site.name, content.site.name);
            }
        }
        var paragraphs = document.getElementById("about-paragraphs");
        clear(paragraphs);
        (about.paragraphs || []).forEach(function (paragraph) {
            if (paragraphs) paragraphs.appendChild(make("p", "", paragraph));
        });
        var stats = document.getElementById("about-stats");
        clear(stats);
        (about.stats || []).forEach(function (stat) {
            var item = make("div");
            item.appendChild(make("span", "block text-4xl lg:text-5xl font-black text-primary mb-2", stat.value));
            item.appendChild(make("span", "text-xs uppercase tracking-widest font-black block", stat.label));
            stats.appendChild(item);
        });
    }

    function renderProjects() {
        var list = document.getElementById("projects-list");
        clear(list);
        (content.projects || []).forEach(function (project, index) {
            var card = make("article", "portfolio-card portfolio-card--project project-card bg-surface-container-low flex flex-col md:flex-row group border border-white/5 hover:border-primary/30 transition-colors brutal-shadow overflow-hidden");
            var titleId = "project-title-" + index;
            card.setAttribute("aria-labelledby", titleId);
            var accent = make("div", (index % 2 ? "bg-tertiary-container/5 border-tertiary-container/20" : "bg-primary/10 border-primary/20") + " project-meta border-b md:border-b-0 md:border-r p-4 md:p-5 flex flex-col items-center justify-center md:min-w-[112px] shrink-0");
            accent.appendChild(make("span", "project-index text-4xl font-black " + (index % 2 ? "text-tertiary-container/40" : "text-primary/40") + " font-headline leading-none", String(index + 1).padStart(2, "0")));
            accent.appendChild(make("span", "project-category " + (index % 2 ? "bg-tertiary-container/10 text-tertiary-container border-tertiary-container/20" : "bg-primary/20 text-primary border-primary/30") + " px-3 py-1 font-black uppercase tracking-widest text-[10px] mt-3 text-center", project.category));
            var body = make("div", "project-body p-5 md:p-6 flex-1 min-w-0");
            if (project.image) {
                var projectMedia = make("div", "project-media portfolio-media portfolio-media--project mb-5");
                setImageState(projectMedia, project.image, project.title + " preview", project.title + " preview");
                body.appendChild(projectMedia);
            }
            var heading = make("div", "project-header flex flex-wrap items-center gap-3 mb-3");
            var title = make("h3", "project-title text-2xl font-headline font-black text-white uppercase", project.title);
            title.id = titleId;
            heading.appendChild(title);
            if (project.date) heading.appendChild(make("span", "project-date text-[10px] text-outline font-black uppercase tracking-widest px-3 py-1 border border-white/10 shrink-0", project.date));
            body.appendChild(heading);
            body.appendChild(make("p", "project-description text-sm text-on-surface-variant leading-relaxed mb-5", project.description));
            var details = make("div", "project-details");
            [["Problem", project.problem], ["Implementation", project.implementation], ["Results", project.results]].forEach(function (detail) {
                if (!detail[1]) return;
                var detailBlock = make("div", "project-detail mb-4");
                detailBlock.appendChild(make("strong", "project-detail__label block text-[10px] font-black uppercase tracking-widest text-primary mb-1", detail[0]));
                detailBlock.appendChild(make("p", "project-detail__text text-sm text-on-surface-variant leading-relaxed", detail[1]));
                details.appendChild(detailBlock);
            });
            if (details.childNodes.length) body.appendChild(details);
            var tags = make("ul", "project-tags flex flex-wrap gap-2", "");
            tags.setAttribute("aria-label", "Technologies used");
            (project.tags || []).forEach(function (tag) {
                var tagItem = make("li", "project-tag");
                tagItem.appendChild(make("span", "bg-surface-container-lowest px-3 py-1 text-[10px] font-black uppercase tracking-widest text-on-surface-variant border border-white/10", tag));
                tags.appendChild(tagItem);
            });
            body.appendChild(tags);
            var links = make("div", "project-links flex flex-wrap items-center gap-x-5 gap-y-2 mt-5");
            if (project.url) {
                var projectLink = make("a", "project-link project-link--live inline-flex text-primary font-black uppercase tracking-widest text-xs hover:text-white", "View project →");
                setExternalLink(projectLink, "View project →", project.url);
                links.appendChild(projectLink);
            }
            if (project.githubUrl) {
                var githubLink = make("a", "project-link project-link--github inline-flex text-primary font-black uppercase tracking-widest text-xs hover:text-white", "GitHub →");
                setExternalLink(githubLink, "GitHub →", project.githubUrl);
                links.appendChild(githubLink);
            }
            if (links.childNodes.length) body.appendChild(links);
            card.appendChild(accent); card.appendChild(body); list.appendChild(card);
        });
    }

    function renderSkills() {
        var list = document.getElementById("skills-list");
        clear(list);
        (content.skills || []).forEach(function (skill) {
            var card = make("article", "portfolio-card portfolio-card--skill bg-surface-container-lowest p-6 md:p-8 border-t-4 border-primary hover:-translate-y-2 transition-transform duration-300 brutal-shadow");
            var heading = make("h4", "text-lg font-black uppercase text-primary mb-6 flex items-center gap-3");
            heading.appendChild(make("span", "material-symbols-outlined text-outline", skill.icon));
            heading.appendChild(document.createTextNode(skill.category));
            card.appendChild(heading);
            var items = make("ul", "space-y-4 text-on-surface-variant font-bold tracking-wide uppercase text-xs md:text-sm");
            (skill.items || []).forEach(function (item) { items.appendChild(make("li", "", item)); });
            card.appendChild(items); list.appendChild(card);
        });
    }

    function renderExperience() {
        var list = document.getElementById("experience-list");
        clear(list);
        (content.experience || []).forEach(function (entry) {
            var card = make("article", "portfolio-card portfolio-card--experience bg-surface-container-low p-8 md:p-10 border-l-4 border-primary hover:bg-surface-container-high transition-colors group");
            if (entry.date) card.appendChild(make("span", "text-xs font-black text-outline uppercase tracking-widest block mb-4", entry.date));
            card.appendChild(make("h4", "text-2xl font-black uppercase mb-1", entry.role));
            card.appendChild(make("p", "text-primary font-bold uppercase tracking-widest text-sm mb-6", entry.company));
            var bullets = make("ul", "space-y-3 text-on-surface-variant text-sm md:text-base");
            var highlights = (entry.accomplishments && entry.accomplishments.length ? entry.accomplishments : entry.bullets) || [];
            highlights.forEach(function (bullet) { var li = make("li", "flex gap-3"); li.appendChild(make("span", "text-primary font-bold mt-1", "›")); li.appendChild(make("span", "", bullet)); bullets.appendChild(li); });
            card.appendChild(bullets); list.appendChild(card);
        });
    }

    function renderEducation() {
        var list = document.getElementById("education-list");
        clear(list);
        (content.education || []).forEach(function (entry) {
            var wrapper = make("article", "relative pl-8 md:pl-0");
            var dot = make("div", "absolute left-0 w-5 h-5 bg-primary rounded-full md:left-auto md:right-auto md:-translate-x-1/2 flex items-center justify-center");
            dot.appendChild(make("div", "w-2 h-2 bg-background rounded-full")); wrapper.appendChild(dot);
            var card = make("div", "portfolio-card portfolio-card--education bg-surface-container-low p-6 md:p-8 md:ml-12 border-l-4 border-primary hover:bg-surface-container-high transition-colors group brutal-shadow");
            card.appendChild(make("span", "text-[10px] font-black uppercase tracking-widest text-primary mb-2 block", entry.period));
            card.appendChild(make("h4", "text-lg font-black uppercase mb-1", entry.degree));
            card.appendChild(make("p", "text-sm font-bold text-on-surface-variant mb-4", entry.institution));
            card.appendChild(make("div", "inline-block bg-primary/20 text-primary px-3 py-1 font-black text-[10px] uppercase tracking-widest border border-primary/30", entry.resultLabel + ": " + entry.resultValue));
            wrapper.appendChild(card); list.appendChild(wrapper);
        });
    }

    function renderCertifications() {
        var list = document.getElementById("certifications-list");
        clear(list);
        (content.certifications || []).forEach(function (certificate) {
            var card = make("article", "portfolio-card portfolio-card--certificate bg-surface group relative overflow-hidden border border-white/5 hover:border-primary/50 transition-colors brutal-shadow");
            var media = make("div", "portfolio-media portfolio-media--certificate bg-surface-container-highest relative overflow-hidden");
            setImageState(media, certificate.image, certificate.imageAlt || certificate.title, certificate.title + " certificate");
            card.appendChild(media);
            var body = make("div", "p-6 md:p-8"); body.appendChild(make("span", "text-[10px] font-black uppercase tracking-widest text-primary mb-2 block flex items-center gap-2", "✓ " + certificate.issuer)); body.appendChild(make("h4", "text-xl font-black uppercase mb-2 text-white leading-tight", certificate.title)); body.appendChild(make("p", "text-sm font-bold text-on-surface-variant", certificate.organization));
            if (certificate.url) { var link = make("a", "inline-block mt-4 text-primary text-xs font-black uppercase tracking-widest", "View certificate →"); setExternalLink(link, "View certificate →", certificate.url); body.appendChild(link); }
            card.appendChild(body); list.appendChild(card);
        });
    }

    function renderAchievements() {
        var list = document.getElementById("achievements-list");
        clear(list);
        (content.achievements || []).forEach(function (achievement) {
            var card = make("article", "portfolio-card portfolio-card--achievement bg-surface-container-low p-8 md:p-10 border-l-8 border-primary hover:bg-surface-container-high transition-colors group brutal-shadow");
            var heading = make("div", "flex items-start gap-4 mb-4"); heading.appendChild(make("span", "material-symbols-outlined text-4xl text-primary", "emoji_events")); var headingBody = make("div"); headingBody.appendChild(make("span", "text-[10px] font-black uppercase tracking-widest text-outline block mb-1", achievement.eyebrow)); headingBody.appendChild(make("h4", "text-2xl font-black uppercase text-white", achievement.title)); heading.appendChild(headingBody); card.appendChild(heading);
            if (achievement.description) card.appendChild(make("p", "text-on-surface-variant mb-4", achievement.description));
            var bullets = make("ul", "space-y-3 text-on-surface-variant text-sm md:text-base"); (achievement.bullets || []).forEach(function (bullet) { var li = make("li", "flex gap-3"); li.appendChild(make("span", "text-primary font-bold mt-1", "›")); li.appendChild(make("span", "", bullet)); bullets.appendChild(li); }); card.appendChild(bullets); list.appendChild(card);
        });
    }

    function renderPersonalDetails() {
        var list = document.getElementById("personal-details-list"); clear(list);
        if (list && list.parentElement) list.parentElement.classList.add("portfolio-card", "portfolio-card--details");
        (content.personalDetails || []).forEach(function (detail) { var li = make("li", "flex justify-between border-b border-white/5 pb-3 gap-4"); li.appendChild(make("span", "text-on-surface-variant font-bold uppercase tracking-widest", detail.label)); li.appendChild(make("span", "text-white font-bold text-right", detail.value)); list.appendChild(li); });
    }

    function renderContact() {
        var contact = content.contact;
        setText("contact-eyebrow", contact.eyebrow); setText("contact-title", contact.title); setText("contact-description", contact.description); setText("contact-form-title", contact.formTitle);
        var links = document.getElementById("contact-links"); clear(links);
        function addContact(label, href, icon, external) {
            if (!href) return;
            var row = make("a", "portfolio-link flex items-center gap-6 group"); row.href = href; if (external) { row.target = "_blank"; row.rel = "noopener noreferrer"; }
            row.appendChild(make("div", "w-14 h-14 bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors brutal-shadow", icon)); row.appendChild(make("span", "text-lg md:text-xl font-bold font-headline uppercase", label)); links.appendChild(row);
        }
        addContact("linkedin.com/in/yashrajrr", contact.linkedin, "in", true); addContact("github.com/yashrajrr", contact.github, "⌘", true); addContact(contact.phone, contact.phone ? "tel:" + contact.phone.replace(/[^+\d]/g, "") : "", "☎", false); if (contact.email) addContact(contact.email, "mailto:" + contact.email, "@", false);
        var form = document.getElementById("contact-form");
        if (form) {
            form.classList.add("portfolio-form");
            form.action = contact.formAction || "https://api.web3forms.com/submit";
            var subject = form.querySelector('[name="subject"]');
            if (subject) subject.value = contact.formSubject || "New Submission from Portfolio!";
        }
    }

    function renderFooter() {
        setText("footer-name", content.footer.name); setText("footer-copyright", content.footer.copyright);
        var links = document.getElementById("footer-links"); clear(links);
        (content.footer.links || []).forEach(function (item) { var link = make("a", "text-on-surface-variant hover:text-white transition-colors font-['Inter'] text-xs font-bold tracking-[0.2em] uppercase"); setExternalLink(link, item.label, item.url); links.appendChild(link); });
    }

    function decorateStaticVisuals() {
        var nav = document.querySelector("body > nav");
        if (nav) nav.classList.add("portfolio-nav");
        eachNode(document.querySelectorAll("#hero-focus-label, #hero-based-label"), function (label) {
            var card = label.parentElement;
            if (label.id === "hero-based-label" && card) card = card.parentElement;
            if (card) card.classList.add("portfolio-card", "portfolio-card--hero");
        });
        eachNode(document.querySelectorAll("main a, main button, footer a, nav a"), function (link) {
            link.classList.add("portfolio-link");
            if (link.id && /cta/i.test(link.id)) link.classList.add("portfolio-cta");
            var isNavConnect = link.closest && link.closest("nav") && !link.classList.contains("nav-link") && link.getAttribute("href") === "#contact";
            if (link.id === "submit-btn" || isNavConnect) link.classList.add("portfolio-cta");
        });
    }

    function markReveal(element, delay) {
        if (!element) return;
        element.classList.add("reveal-item");
        element.style.setProperty("--reveal-delay", Math.min(delay || 0, 180) + "ms");
    }

    function decorateRevealElements() {
        // Reveal content-sized elements: observing a whole long section can
        // leave it invisible when it never reaches the intersection threshold.
        eachNode(document.querySelectorAll("main h2, #hero-grid > div:first-child > *, #hero-grid .portfolio-card, #about .portfolio-media, #about-paragraphs, #about-stats, #contact-description, #contact-form, .portfolio-card--details"), function (element, index) {
            markReveal(element, (index % 3) * 55);
        });
        [
            "#projects-list > *", "#skills-list > *", "#experience-list > *", "#education-list > *",
            "#certifications-list > *", "#achievements-list > *", "#contact-links > *"
        ].forEach(function (selector) {
            eachNode(document.querySelectorAll(selector), function (element, index) {
                markReveal(element, (index % 3) * 55);
            });
        });
    }

    function watchMotionPreference() {
        if (revealState.motionMedia || !window.matchMedia) return;
        revealState.motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (revealState.motionMedia.addEventListener) revealState.motionMedia.addEventListener("change", setupReveal);
        else if (revealState.motionMedia.addListener) revealState.motionMedia.addListener(setupReveal);
    }

    function setupReveal() {
        watchMotionPreference();
        if (revealState.observer) revealState.observer.disconnect();
        revealState.observer = null;
        var nodes = document.querySelectorAll(".reveal-item");
        var reduced = prefersReducedMotion();
        if (reduced || !window.IntersectionObserver) {
            eachNode(nodes, function (node) { node.classList.remove("reveal-pending"); node.classList.add("reveal-visible"); });
            return;
        }
        revealState.observer = new window.IntersectionObserver(function (entries, observer) {
            eachNode(entries, function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.remove("reveal-pending");
                entry.target.classList.add("reveal-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
        eachNode(nodes, function (node) {
            if (node.classList.contains("reveal-visible")) return;
            if (isHidden(node) || !node.getClientRects().length) return;
            if (node.getBoundingClientRect().bottom < 0) {
                node.classList.remove("reveal-pending");
                node.classList.add("reveal-visible");
                return;
            }
            node.classList.add("reveal-pending");
            revealState.observer.observe(node);
        });
    }

    function getScrollTop() {
        return window.pageYOffset || document.documentElement.scrollTop || (document.body && document.body.scrollTop) || 0;
    }

    function getDocumentTop(element) {
        if (!element) return 0;
        if (typeof element.getBoundingClientRect === "function") {
            var rect = element.getBoundingClientRect();
            if (rect && typeof rect.top === "number") return rect.top + getScrollTop();
        }
        var top = 0;
        var current = element;
        while (current) {
            top += current.offsetTop || 0;
            current = current.offsetParent;
        }
        return top;
    }

    function getFixedNavOffset() {
        var nav = document.querySelector("body > nav") || document.querySelector("nav");
        if (!nav) return 0;
        var rect = typeof nav.getBoundingClientRect === "function" ? nav.getBoundingClientRect() : null;
        var height = rect && typeof rect.height === "number" ? rect.height : nav.offsetHeight;
        return Math.max(0, height || 0);
    }

    function getNavigationTargets() {
        var links = {};
        eachNode(document.querySelectorAll(".nav-link"), function (link) {
            var href = link.getAttribute("href") || "";
            if (href.charAt(0) === "#") links[href.slice(1)] = link;
        });
        return navItems.map(function (item, index) {
            var id = item[1].slice(1);
            return { id: id, element: document.getElementById(id), link: links[id], order: index };
        }).filter(function (target) { return !!target.element && !!target.link; });
    }

    function setActiveSection() {
        var links = document.querySelectorAll(".nav-link");
        var targets = navigationState.sections.filter(function (target) {
            return target.element && target.link && !target.link.hidden && !isHidden(target.element);
        }).map(function (target) {
            return { target: target, top: getDocumentTop(target.element) };
        }).sort(function (left, right) {
            return left.top - right.top || left.target.order - right.target.order;
        });

        eachNode(links, function (link) {
            link.classList.remove("is-active");
            link.removeAttribute("aria-current");
        });
        if (!targets.length) return;

        var scrollTop = getScrollTop();
        var marker = scrollTop + Math.min((window.innerHeight || 0) * 0.38, 280);
        var current = targets[0];
        targets.forEach(function (target) {
            if (target.top <= marker) current = target;
        });
        current.target.link.classList.add("is-active");
        current.target.link.setAttribute("aria-current", "location");
    }

    function resolveSamePageTarget(link) {
        var href = link.getAttribute("href") || "";
        if (!href || href === "#") return null;
        var hash = "";
        if (href.charAt(0) === "#") {
            hash = href.slice(1);
        } else {
            try {
                var targetUrl = new URL(link.href, window.location.href);
                var currentUrl = new URL(window.location.href);
                if (targetUrl.origin !== currentUrl.origin || targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search) return null;
                hash = targetUrl.hash.slice(1);
            } catch (ignored) {
                return null;
            }
        }
        if (!hash) return null;
        try { hash = decodeURIComponent(hash); } catch (ignoredDecode) { return null; }
        return document.getElementById(hash);
    }

    function setupAnchorNavigation() {
        if (navigationState.anchorClickHandler) return;
        navigationState.anchorClickHandler = function (event) {
            if (event.defaultPrevented || (event.button && event.button !== 0) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            var source = event.target;
            var link = source && source.closest ? source.closest("a[href]") : null;
            if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
            var target = resolveSamePageTarget(link);
            if (!target || isHidden(target)) return;
            event.preventDefault();
            var top = Math.max(0, getDocumentTop(target) - getFixedNavOffset());
            var behavior = prefersReducedMotion() ? "auto" : "smooth";
            if (typeof window.scrollTo === "function") {
                try {
                    window.scrollTo({ top: top, left: window.pageXOffset || 0, behavior: behavior });
                } catch (ignoredScrollOptions) {
                    window.scrollTo(0, top);
                }
            }
            if (window.history && typeof window.history.pushState === "function") {
                try { window.history.pushState(null, "", "#" + encodeURIComponent(target.id)); } catch (ignoredHistory) { }
            }
        };
        document.addEventListener("click", navigationState.anchorClickHandler);
    }

    function setupNavigation() {
        if (navigationState.scrollHandler) window.removeEventListener("scroll", navigationState.scrollHandler);
        if (navigationState.resizeHandler) window.removeEventListener("resize", navigationState.resizeHandler);
        navigationState.sections = getNavigationTargets();
        navigationState.frame = 0;
        navigationState.scrollHandler = function () {
            if (navigationState.frame) return;
            navigationState.frame = requestFrame(function () { navigationState.frame = 0; setActiveSection(); });
        };
        navigationState.resizeHandler = function () { setActiveSection(); };
        window.addEventListener("scroll", navigationState.scrollHandler, { passive: true });
        window.addEventListener("resize", navigationState.resizeHandler, { passive: true });
        setupAnchorNavigation();
        setActiveSection();
    }

    function updateScrollChrome() {
        if (!scrollChromeState.progress) return;
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
        var maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        var amount = maxScroll ? Math.max(0, Math.min(1, scrollTop / maxScroll)) : 0;
        var percent = Math.round(amount * 100);
        scrollChromeState.progress.style.setProperty("--scroll-progress", amount);
        scrollChromeState.progress.setAttribute("aria-valuenow", String(percent));
        scrollChromeState.progress.setAttribute("aria-valuetext", percent + "% of page read");
        var nav = document.querySelector(".portfolio-nav");
        if (nav) nav.classList.toggle("is-scrolled", scrollTop > 12);
    }

    function setupScrollChrome() {
        if (!scrollChromeState.progress) {
            scrollChromeState.progress = document.getElementById("scroll-progress");
            if (!scrollChromeState.progress) {
                scrollChromeState.progress = make("div", "scroll-progress");
                scrollChromeState.progress.id = "scroll-progress";
                scrollChromeState.progress.setAttribute("role", "progressbar");
                scrollChromeState.progress.setAttribute("aria-label", "Page reading progress");
                scrollChromeState.progress.setAttribute("aria-valuemin", "0");
                scrollChromeState.progress.setAttribute("aria-valuemax", "100");
                document.body.appendChild(scrollChromeState.progress);
            }
        }
        if (!scrollChromeState.scrollHandler) {
            scrollChromeState.scrollHandler = function () {
                if (scrollChromeState.frame) return;
                scrollChromeState.frame = requestFrame(function () { scrollChromeState.frame = 0; updateScrollChrome(); });
            };
            scrollChromeState.resizeHandler = function () { updateScrollChrome(); };
            window.addEventListener("scroll", scrollChromeState.scrollHandler, { passive: true });
            window.addEventListener("resize", scrollChromeState.resizeHandler, { passive: true });
        }
        updateScrollChrome();
    }

    function refreshPublicEnhancements() {
        decorateStaticVisuals();
        decorateRevealElements();
        setupReveal();
        setupNavigation();
        setupScrollChrome();
    }

    function applyAppearance() {
        var appearance = content.appearance || {};
        var body = document.body;
        var applied = window.PortfolioAppearance && typeof window.PortfolioAppearance.apply === "function" ? window.PortfolioAppearance.apply(appearance) : { theme: appearance.theme || "midnight", headingFont: appearance.headingFont || "Public Sans", bodyFont: appearance.bodyFont || "Inter" };
        body.dataset.theme = applied.theme;
        body.dataset.headingFont = applied.headingFont;
        body.dataset.bodyFont = applied.bodyFont;
        body.dataset.radius = appearance.radius || "sharp";
        body.dataset.animation = appearance.animation || "subtle";
        body.dataset.heroLayout = appearance.heroLayout || "split";
        body.style.setProperty("--theme-accent", appearance.accentColor || "#c0c1ff");
        var sectionVisibility = appearance.sectionVisibility || {};
        ["about", "projects", "skills", "certifications", "awards", "contact"].forEach(function (key) {
            var section = document.getElementById(key);
            if (!section || section.tagName !== "SECTION") section = document.querySelector("main section#" + key);
            if (section) section.hidden = sectionVisibility[key] === false;
        });
        var experienceSection = document.querySelector("main section#experience");
        var experienceList = document.getElementById("experience-list");
        var educationColumn = document.getElementById("education");
        if (experienceList) experienceList.parentElement.hidden = sectionVisibility.experience === false;
        if (educationColumn) educationColumn.hidden = sectionVisibility.education === false;
        if (experienceSection) experienceSection.hidden = sectionVisibility.experience === false && sectionVisibility.education === false;
        document.querySelectorAll(".nav-link").forEach(function (link) {
            var key = navItems.filter(function (item) { return item[1] === link.getAttribute("href"); })[0];
            link.hidden = !!key && key[2] !== "home" && appearance.navigationVisibility[key[2]] === false;
        });
    }

    function render(nextContent) {
        if (nextContent) {
            var validated = ContentStore.validate(nextContent);
            if (!validated.valid) return false;
            content = validated.value;
        } else {
            // Public visitors should never see an unsaved admin draft from
            // this browser. Start from the committed seed and replace it only
            // with the authenticated publishing service's public row.
            content = ContentStore.defaults();
        }
        applyAppearance();
        document.title = content.site.title;
        var meta = document.querySelector('meta[name="description"]'); if (meta) meta.content = content.site.description;
        var canonical = document.getElementById("canonical-link"); if (canonical) canonical.href = content.site.canonicalUrl || window.location.href.split("#")[0];
        var ogTitle = document.querySelector('meta[property="og:title"]'); if (ogTitle) ogTitle.content = content.site.title;
        var ogDescription = document.querySelector('meta[property="og:description"]'); if (ogDescription) ogDescription.content = content.site.description;
        var ogImage = document.querySelector('meta[property="og:image"]'); if (ogImage) ogImage.content = content.about.image || "";
        renderNavigation(); renderHero(); renderAbout(); renderProjects(); renderSkills(); renderExperience(); renderEducation(); renderCertifications(); renderAchievements(); renderPersonalDetails(); renderContact(); renderFooter();
        refreshPublicEnhancements();
        return true;
    }

    function loadPublishedPublicContent() {
        if (new URLSearchParams(window.location.search).get("preview") === "1") return;
        if (!window.PortfolioSupabase || typeof window.PortfolioSupabase.ready !== "function") return;

        window.PortfolioSupabase.ready().then(function (state) {
            if (!state || !state.available) return null;
            return window.PortfolioSupabase.loadPublishedContent();
        }).then(function (record) {
            if (record && record.content) render(record.content);
        }).catch(function () {
            // The committed seed remains the safe public fallback when the
            // optional shared content service is unavailable.
        });
    }

    function setupContactForm() {
        var contactForm = document.getElementById("contact-form");
        if (!contactForm) return;
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();
            var form = event.target; var data = new FormData(form); var button = document.getElementById("submit-btn"); var currentTime = Date.now(); var history = [];
            try { history = JSON.parse(localStorage.getItem("submission_history") || "[]"); } catch (ignored) { history = []; }
            history = history.filter(function (time) { return currentTime - time < 600000; });
            if (history.length >= 3) { button.textContent = "LOCKED (10m)"; button.disabled = true; setTimeout(function () { button.disabled = false; button.textContent = "EXECUTE_TRANSMISSION"; }, 3000); return; }
            var payload = {}; data.forEach(function (value, key) { payload[key] = typeof value === "string" ? value.replace(/</g, "&lt;").replace(/>/g, "&gt;") : value; }); button.textContent = "TRANSMITTING..."; button.disabled = true;
            fetch(form.action, { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json", Accept: "application/json" } }).then(function (response) { return response.json(); }).then(function (result) { if (!result.success) throw new Error("Rejected"); form.reset(); history.push(currentTime); localStorage.setItem("submission_history", JSON.stringify(history)); button.textContent = "DELIVERED"; setTimeout(function () { button.disabled = false; button.textContent = "EXECUTE_TRANSMISSION"; }, 4000); }).catch(function () { button.textContent = "NETWORK ERROR"; setTimeout(function () { button.disabled = false; button.textContent = "EXECUTE_TRANSMISSION"; }, 4000); });
        });
    }

    function init() {
        render(); setupContactForm(); loadPublishedPublicContent();
        if (new URLSearchParams(window.location.search).get("preview") === "1") {
            window.addEventListener("message", function (event) {
                if (event.origin !== window.location.origin || event.source !== window.parent || !event.data || event.data.type !== "portfolio:preview") return;
                if (render(event.data.content)) event.source.postMessage({ type: "portfolio:preview-applied" }, event.origin);
            });
            if (window.parent !== window) window.parent.postMessage({ type: "portfolio:preview-ready" }, window.location.origin);
        }
        window.addEventListener("storage", function (event) { if (event.key === ContentStore.storageKey) render(); });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
}());
