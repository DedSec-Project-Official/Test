/* ============================================================================
   MAINTENANCE (DedSec Project)
   - Theme + language persistence is handled here (localStorage).
   - If assets break on sub-pages, check SITE_BASE resolver at the top.
   - NAV highlights & mobile menu behaviors are also here.
   ============================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL STATE ---
    let currentLanguage = 'en';

    // --- NAV WORD STACK + MENU OFFSET (keeps navbar compact so logo stays visible) ---
    const applyNavbarWordStack = () => {
        // Only for the navbar labels (and title). We don't want to affect normal body text.
        const targets = document.querySelectorAll(
            '.main-nav .nav-title h1, .main-nav .nav-action-label, .main-nav .burger-label'
        );

        const stackTextNodes = (root) => {
            try {
                const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
                    acceptNode: (node) => (node.nodeValue && node.nodeValue.trim().length ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT)
                });
                const nodes = [];
                while (walker.nextNode()) nodes.push(walker.currentNode);
                nodes.forEach(node => {
                    const raw = (node.nodeValue || '').trim();
                    if (/\s+/.test(raw)) node.nodeValue = raw.split(/\s+/).join('\n');
                });
            } catch (_) {
                // Fallback: do nothing
            }
        };

        targets.forEach(stackTextNodes);
    };

    const setViewportUnits = () => {
        // iOS Safari (and many in-app browsers) report unstable 100vh.
        // We use a JS-driven CSS var for reliable full-height layouts.
        const h = (window.visualViewport?.height || window.innerHeight || 0);
        if (h) document.documentElement.style.setProperty('--vh', `${h * 0.01}px`);
    };

    const syncNavMenuOffset = () => {
        const nav = document.querySelector('.main-nav');
        if (!nav) return;
        const h = Math.ceil(nav.getBoundingClientRect().height || 70);
        document.documentElement.style.setProperty('--nav-h', `${h}px`);
    };

    const syncLayoutVars = () => {
        setViewportUnits();
        // IMPORTANT: do NOT call syncLayoutVars() inside itself (infinite recursion).
        // We only need to recompute CSS vars that depend on viewport + navbar height.
        syncNavMenuOffset();
    };

    // --- BRAND ASSETS (Theme-aware) ---
    // IMPORTANT (GitHub Pages + subpages):
    // Any relative URL like "Assets/..." breaks on pages like /Pages/faq.html
    // because it resolves to /Pages/Assets/... (404). We resolve assets from the
    // actual location of script.js so it works everywhere (root domain, /repo/, etc.).
    const SITE_BASE = (() => {
        const scriptEl = document.querySelector('script[src$="script.js"], script[src*="/script.js"], script[src*="script.js?"]');
        try {
            if (scriptEl?.src) return new URL('./', scriptEl.src).href;
        } catch (_) {}
        // Fallback: best-effort
        return new URL('./', window.location.href).href;
    })();

    const assetUrl = (path) => {
        const clean = (path || '').replace(/^\/+/, '');
        return new URL(clean, SITE_BASE).href;
    };

    const LOGO_DARK = assetUrl('Assets/Images/Logos/Black%20Purple%20Butterfly%20Logo.jpeg');
    const LOGO_LIGHT = assetUrl('Assets/Images/Logos/White%20Purple%20Butterfly%20Logo.jpeg');

    const getThemeLogo = () => (document.body.classList.contains('light-theme') ? LOGO_LIGHT : LOGO_DARK);

    const applyThemeAssets = () => {
        const url = getThemeLogo();

        // Navbar logo (injected into title)
        document.querySelectorAll('img[data-site-logo="1"]').forEach(img => {
            if (img.src !== url) img.src = url;
        });

        // Favicon fallback (helps when some subpages have broken relative paths)
        const icon = document.querySelector('link[rel="icon" i]') || document.querySelector('link[rel="shortcut icon" i]');
        if (icon) icon.href = url;
    };


    const updateNavControls = () => {
        const isLight = document.body.classList.contains('light-theme');

        const themeBtn = document.getElementById('nav-theme-switcher');
        if (themeBtn) {
            const themeIcon = themeBtn.querySelector('.nav-theme-icon');
            if (themeIcon) {
                themeIcon.classList.remove('fa-sun', 'fa-moon');
                themeIcon.classList.add(isLight ? 'fa-moon' : 'fa-sun');
            }
            themeBtn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
            themeBtn.setAttribute('title', isLight ? 'Dark theme' : 'Light theme');
        }

        const langBtn = document.getElementById('nav-lang-switcher');
        if (langBtn) {
            const langLabel = langBtn.querySelector('.nav-action-label');
            const nextIsGreek = currentLanguage === 'en';
            if (langLabel) langLabel.textContent = nextIsGreek ? 'ΕΛ' : 'EN';
            langBtn.setAttribute('aria-label', nextIsGreek ? 'Change language to Greek' : 'Change language to English');
            langBtn.setAttribute('title', nextIsGreek ? 'Ελληνικά' : 'English');
        }

        const burgerMenu = document.getElementById('burger-menu');
        const burgerLabel = burgerMenu?.querySelector('.burger-label');
        if (burgerLabel) burgerLabel.textContent = currentLanguage === 'gr' ? 'Μενού' : 'Menu';
        if (burgerMenu) burgerMenu.setAttribute('aria-label', currentLanguage === 'gr' ? 'Μενού' : 'Menu');
    };
    // --- NAVIGATION FUNCTIONALITY ---
    function initializeNavigation() {
        const burgerMenu = document.getElementById('burger-menu');
        const navMenu = document.getElementById('nav-menu');

        const setMenuState = (isOpen) => {
            if (!burgerMenu || !navMenu) return;
            burgerMenu.classList.toggle('active', isOpen);
            navMenu.classList.toggle('active', isOpen);
            burgerMenu.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            document.body.classList.toggle('menu-open', isOpen);
        };
        
        if (burgerMenu && navMenu) {
            burgerMenu.setAttribute('aria-expanded', 'false');
            burgerMenu.addEventListener('click', () => {
                setMenuState(!navMenu.classList.contains('active'));
            });
        }

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => setMenuState(false));
        });

        document.addEventListener('click', (e) => {
            if (navMenu?.classList.contains('active')) {
                const navActions = document.querySelector('.nav-actions');
                if (!navMenu.contains(e.target) && !burgerMenu?.contains(e.target) && !navActions?.contains(e.target)) {
                    setMenuState(false);
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu?.classList.contains('active')) setMenuState(false);
        });
    }

    // --- THEME SWITCHER ---
    function initializeThemeSwitcher() {
        const themeBtn = document.getElementById('nav-theme-switcher');
        if (!themeBtn) return;

        // Restore saved theme
        if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-theme');
        updateNavControls();

        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            if (typeof applyThemeAssets === 'function') applyThemeAssets();
            updateNavControls();
        });
    }

    // --- LANGUAGE MANAGEMENT ---
    window.changeLanguage = (lang) => {
        currentLanguage = lang;
        document.documentElement.lang = lang;
        localStorage.setItem('language', lang);
        
        document.querySelectorAll('[data-en]').forEach(el => {
            const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
            // Update text while preserving icons/children if they exist
            if (el.children.length === 0) {
                el.textContent = text;
            } else {
                Array.from(el.childNodes).forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                        node.textContent = text;
                    }
                });
            }
        });

        document.querySelectorAll('[data-lang-section]').forEach(el => {
            const isMatch = el.dataset.langSection === lang;
            el.style.display = isMatch ? 'block' : 'none';
            el.classList.toggle('hidden-by-default', !isMatch);
        });

        // Update Dynamic Links (like Stripe)
        document.querySelectorAll('.payment-btn').forEach(link => {
            const newLink = link.getAttribute(`data-${lang}-link`);
            if (newLink) link.href = newLink;
        });

        // Sync search UI language
        if (typeof window.__updateSearchLanguage === 'function') {
            window.__updateSearchLanguage();
        }

        // Sync assistant UI language
        if (typeof window.__updateAssistantLanguage === 'function') {
            window.__updateAssistantLanguage();
        }

        updateNavControls();

        const backToTopBtn = document.querySelector('.back-to-top-trigger');
        if (backToTopBtn) {
            backToTopBtn.setAttribute('aria-label', currentLanguage === 'gr' ? 'Επιστροφή στην κορυφή' : 'Back to top');
            backToTopBtn.setAttribute('title', currentLanguage === 'gr' ? 'Κορυφή' : 'Top');
        }

        // Keep the navbar compact (so the injected logo doesn't get clipped)
        applyNavbarWordStack();
        syncLayoutVars();
    };

    // --- SHARED UTILITIES (COPY, CAROUSEL, ACCORDION) ---
    window.copyToClipboard = async (button, targetId) => {
        const el = document.getElementById(targetId);
        const text = (el?.innerText || el?.textContent || '').trim();
        if (!text || !button) return;

        const showFeedback = (ok) => {
            const original = button.textContent;
            button.textContent = ok
                ? (currentLanguage === 'gr' ? 'Αντιγράφηκε!' : 'Copied!')
                : (currentLanguage === 'gr' ? 'Απέτυχε' : 'Failed');
            button.classList.toggle('copy-success', ok);
            button.classList.toggle('copy-fail', !ok);
            setTimeout(() => {
                button.textContent = original;
                button.classList.remove('copy-success', 'copy-fail');
            }, 1500);
        };

        // Preferred: modern async clipboard (requires HTTPS + user gesture)
        try {
            if (navigator.clipboard?.writeText && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                showFeedback(true);
                return;
            }
            throw new Error('Clipboard API unavailable');
        } catch (_) {
            // Fallback for iOS / in-app browsers: execCommand copy
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.setAttribute('readonly', '');
                ta.style.position = 'fixed';
                ta.style.top = '-1000px';
                ta.style.left = '-1000px';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.focus({ preventScroll: true });
                ta.select();
                const ok = document.execCommand('copy');
                document.body.removeChild(ta);
                showFeedback(!!ok);
                return;
            } catch {
                showFeedback(false);
            }
        }
    };

    function initializeToolCategories(selector) {
        const container = document.querySelector(selector);
        if (!container) return;
        container.querySelectorAll('.category-header').forEach(h => h.addEventListener('click', () => h.parentElement.classList.toggle('active')));
        container.querySelectorAll('.tool-header').forEach(h => h.addEventListener('click', (e) => { e.stopPropagation(); h.parentElement.classList.toggle('active'); }));
    }

    function initializeCarousels() {
        document.querySelectorAll('.collaborations-carousel').forEach(c => {
            const imgs = c.querySelectorAll('.slide-image');
            let idx = 0;
            c.querySelector('.prev-btn')?.addEventListener('click', () => { idx = (idx > 0) ? idx - 1 : imgs.length - 1; show(); });
            c.querySelector('.next-btn')?.addEventListener('click', () => { idx = (idx < imgs.length - 1) ? idx + 1 : 0; show(); });
            const show = () => imgs.forEach((img, i) => img.classList.toggle('active', i === idx));
            show();
        });
    }

    
    // --- SITE SEARCH (IN-PAGE + CROSS-PAGE LINKS) ---
    function initializeSearch() {
        // Inject button (nav) + modal once
        const navActions = document.querySelector('.nav-actions');
        if (navActions && !document.getElementById('nav-search')) {
            const btn = document.createElement('button');
            btn.id = 'nav-search';
            btn.className = 'nav-action-btn';
            btn.setAttribute('type', 'button');
            btn.innerHTML = `
                <i class="fas fa-magnifying-glass"></i>
                <span data-en="Search" data-gr="Αναζήτηση">Search</span>
            `;
            navActions.prepend(btn);
        }

        if (!document.getElementById('search-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'search-overlay';
            overlay.className = 'search-overlay';
            overlay.innerHTML = `
                <div class="search-modal" role="dialog" aria-modal="true" aria-labelledby="search-title">
                    <div class="search-top">
                        <input id="search-input" class="search-input" type="search" autocomplete="off" spellcheck="false"
                            placeholder="Search the site..."
                            aria-label="Search the site" />
                        <button id="search-close" class="search-close" type="button" aria-label="Close search">
                            <i class="fas fa-xmark"></i>
                        </button>
                    </div>
                    <div class="search-results" id="search-results" role="listbox" aria-label="Search results"></div>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        const overlay = document.getElementById('search-overlay');
        const input = document.getElementById('search-input');
        const resultsEl = document.getElementById('search-results');
        const closeBtn = document.getElementById('search-close');
        const openBtn = document.getElementById('nav-search');

        if (!overlay || !input || !resultsEl || !closeBtn || !openBtn) return;

        const slugify = (str) => {
            return (str || '')
                .toLowerCase()
                .trim()
                .replace(/['"`]/g, '')
                .replace(/[^a-z0-9\u0370-\u03ff]+/g, '-') // keep Greek
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                .slice(0, 64) || 'section';
        };

        
        const SEARCH_VERSION = '2026-02-19-v9';
        const SEARCH_STORAGE_KEY = `dedsec_search_index_${SEARCH_VERSION}`;
        const SEARCH_PAGES_STORAGE_KEY = `dedsec_search_pages_${SEARCH_VERSION}`;

        // Pages we always want searchable (static, always exist).
        const BASE_PAGES = [
            "index.html",
            "Pages/our-vision.html",
            "Pages/learn-about-the-tools.html",
            "Pages/guide-for-installation.html",
            "Pages/faq.html",
            "Pages/collaborations.html",
            "Pages/contact-credits.html",
            "Pages/privacy-policy.html",        ];
        const loadStoredPagesList = () => {
            try {
                const raw = localStorage.getItem(SEARCH_PAGES_STORAGE_KEY);
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                if (!Array.isArray(parsed) || parsed.length < 5) return null;
                return parsed;
            } catch (_) {
                return null;
            }
        };

        const storePagesList = (pages) => {
            try {
                localStorage.setItem(SEARCH_PAGES_STORAGE_KEY, JSON.stringify(pages));
            } catch (_) {
                // ignore
            }
        };

        const detectGitHubRepoFromLocation = () => {
            const host = String(location.hostname || '').toLowerCase();
            if (!host.endsWith('github.io')) return null;

            const owner = host.split('.')[0];
            const parts = String(location.pathname || '').split('/').filter(Boolean);

            // User/organization site: https://owner.github.io/  => repo is owner.github.io
            // Project site:          https://owner.github.io/repo/ => repo is the first path segment
            const repo = parts.length ? parts[0] : `${owner}.github.io`;
            return { owner, repo };
        };

        const loadSiteConfig = async () => {
            // site-config.json is at the site root
            try {
                const url = new URL('site-config.json', SITE_BASE).href;
                const res = await fetch(url, { cache: 'no-store' });
                if (!res.ok) throw new Error('config fetch failed');
                const cfg = await res.json();
                return cfg || {};
            } catch (_) {
                return {};
            }
        };

        const fetchRepoBlogFiles = async ({ owner, repo, branch, blogDir }) => {
            const base = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(blogDir)}`;
            const withRef = branch ? `${base}?ref=${encodeURIComponent(branch)}` : base;

            let res = await fetch(withRef, {
                headers: { Accept: 'application/vnd.github+json' },
                cache: 'no-store'
            });

            // If the branch is wrong (common when copying to a new repo), retry without ref.
            if (!res.ok && branch) {
                res = await fetch(base, {
                    headers: { Accept: 'application/vnd.github+json' },
                    cache: 'no-store'
                });
            }

            if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);

            const data = await res.json();
            if (!Array.isArray(data)) return [];
            return data
                .filter((x) => x && x.type === 'file' && /\.html?$/i.test(x.name))
                .map((x) => String(x.name));
        };

        let cachedPagesList = loadStoredPagesList();
        let pagesListPromise = null;

        const getSearchPagesAsync = async () => {
            if (cachedPagesList) return cachedPagesList;
            if (pagesListPromise) return pagesListPromise;

            pagesListPromise = (async () => {
                let pages = [...BASE_PAGES];
// Normalize + dedupe
                const seen = new Set();
                pages = pages
                    .map(p => String(p || '').replace(/^\/+/, ''))
                    .filter(Boolean)
                    .filter(p => {
                        if (seen.has(p)) return false;
                        seen.add(p);
                        return true;
                    });

                cachedPagesList = pages;
                storePagesList(pages);
                return pages;
            })();

            return pagesListPromise;
        };

        const toFetchUrl = (path) => {
            try { return new URL((path || '').replace(/^\/+/, ''), SITE_BASE).href; } catch (_) { return path; }
        };
const ensureDeterministicIds = (doc) => {
            const scope = doc.querySelector('main') || doc.body;
            if (!scope) return;
            const candidates = scope.querySelectorAll('h1, h2, h3, h4, .feature-title, .tool-title, .category-header');
            const used = new Map();

            candidates.forEach((el) => {
                const raw = (el.getAttribute('data-en') || el.textContent || '').trim();
                if (!raw) return;

                // If the element already has an ID, keep it.
                if (el.id) {
                    used.set(el.id, true);
                    return;
                }

                const base = slugify(raw);
                let unique = base;
                let n = 2;
                while (used.has(unique) || doc.getElementById(unique)) {
                    unique = `${base}-${n++}`;
                }
                el.id = unique;
                used.set(unique, true);
            });
        };

        const currentPagePath = () => {
            const parts = window.location.pathname.split('/').filter(Boolean);
            const file = (parts.pop() || 'index.html');
            // Works on root domains AND project pages like /repo/Pages/... because we don't assume depth.
            if (parts.includes('Pages')) return `Pages/${file}`;
return file;
        };

        const buildPageItems = (doc, pagePath) => {
            ensureDeterministicIds(doc);

            const pageTitle = (doc.querySelector('title')?.textContent || '').trim();
            const label =
                pageTitle ||
                pagePath
                    .replace(/^Pages\//, '')
                    .replace(/\.html$/i, '')
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (m) => m.toUpperCase());

            const scope = doc.querySelector('main') || doc.body;
            const candidates = scope ? scope.querySelectorAll('h1, h2, h3, h4, .feature-title, .tool-title, .category-header') : [];
            const items = [];

            candidates.forEach((el) => {
                const en = (el.getAttribute('data-en') || '').trim();
                const gr = (el.getAttribute('data-gr') || '').trim();
                const fallback = (el.textContent || '').trim();

                const display = (currentLanguage === 'gr' ? (gr || en || fallback) : (en || gr || fallback)).trim();
                if (!display || display.length < 3) return;

                const keywords = [fallback, en, gr].filter(Boolean).join(' ').toLowerCase();
                const hash = el.id ? `#${el.id}` : '';

                items.push({
                    title_en: (en || fallback).trim(),
                    title_gr: (gr || en || fallback).trim(),
                    title: (en || gr || fallback).trim(),
                    meta: label,
                    url: `${pagePath}${hash}`,
                    keywords
                });
});

            return items;
        };

        const loadStoredIndex = () => {
            try {
                const raw = localStorage.getItem(SEARCH_STORAGE_KEY);
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                if (!Array.isArray(parsed) || parsed.length < 10) return null;
                return parsed;
            } catch (_) {
                return null;
            }
        };

        const storeIndex = (items) => {
            try {
                localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(items));
            } catch (_) {
                // ignore
            }
        };

        let cachedIndex = loadStoredIndex();
        let buildingPromise = null;

        const buildIndexAsync = async () => {
            if (cachedIndex) return cachedIndex;
            if (buildingPromise) return buildingPromise;

            buildingPromise = (async () => {
                // Always include current page first (fast)
                ensureDeterministicIds(document);
                const items = buildPageItems(document, currentPagePath());

                const current = currentPagePath();
                const allPages = await getSearchPagesAsync();
                const others = allPages.filter(p => p !== current);

                const fetchOne = async (path) => {
                    const res = await fetch(toFetchUrl(path), { cache: 'force-cache' });
                    if (!res.ok) throw new Error(`Fetch failed: ${path}`);
                    const html = await res.text();
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    return buildPageItems(doc, path);
                };

                const settled = await Promise.allSettled(others.map(fetchOne));
                settled.forEach((r) => {
                    if (r.status === 'fulfilled' && Array.isArray(r.value)) items.push(...r.value);
                });

                // Deduplicate by URL
                const seen = new Set();
                const deduped = items.filter(it => {
                    if (!it || !it.url) return false;
                    if (seen.has(it.url)) return false;
                    seen.add(it.url);
                    return true;
                });

                cachedIndex = deduped;
                storeIndex(deduped);
                return deduped;
            })();

            return buildingPromise;
        };
;

        const setOverlayVisible = (visible) => {
            overlay.classList.toggle('visible', visible);
            document.body.style.overflow = visible ? 'hidden' : '';
            if (visible) {
                // Build the full site index (across all pages) on first open
                buildIndexAsync().catch(() => {});
                input.focus({ preventScroll: true });
                input.select();
                renderResults(input.value.trim());
            }
        };

        const resolveUrl = (url) => {
            if (!url) return '';
            if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')) return url;
            if (url.startsWith('#')) return url;
            try {
                return new URL(url.replace(/^\/+/, ''), SITE_BASE).href;
            } catch (_) {
                return url;
            }
        };

        const navigate = (url) => {
            let target;
            try {
                if (url && url.startsWith('#')) {
                    const base = window.location.href.split('#')[0];
                    target = new URL(base + url);
                } else {
                    target = new URL((url || '').replace(/^\/+/, ''), SITE_BASE);
                }
            } catch (_) {
                window.location.href = url;
                return;
            }

            const current = new URL(window.location.href);
            if (target.pathname === current.pathname && target.hash) {
                const id = target.hash.replace('#', '');
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.location.hash = target.hash;
            } else {
                window.location.href = target.href;
            }
        };

        const pageNameForNav = () => (window.location.pathname.split('/').pop() || 'index.html');

        const renderResults = async (query) => {
            const q = (query || '').toLowerCase();
            resultsEl.setAttribute('aria-busy', 'true');
            const index = await buildIndexAsync();
            resultsEl.removeAttribute('aria-busy');

            if (!q) {
                resultsEl.innerHTML = `
                    <a class="search-item" href="${resolveUrl('index.html')}" role="option">
                        <div class="search-item-title"><i class="fas fa-house"></i><span>Home</span></div>
                        <div class="search-item-meta">Tip: press <span style="opacity:.9">/</span> or <span style="opacity:.9">Ctrl+K</span> to search</div>
                    </a>
                `;
                return;
            }

            const hits = index
                .filter(it => it.keywords.includes(q) || ((currentLanguage === 'gr' ? (it.title_gr || it.title || '') : (it.title_en || it.title || '')).toLowerCase().includes(q)))
                .slice(0, 20);

            if (!hits.length) {
                resultsEl.innerHTML = `
                    <div class="search-item" role="option" tabindex="0">
                        <div class="search-item-title"><i class="fas fa-circle-info"></i><span>${currentLanguage === 'gr' ? 'Δεν βρέθηκαν αποτελέσματα' : 'No results found'}</span></div>
                        <div class="search-item-meta">${currentLanguage === 'gr' ? 'Δοκιμάστε άλλη λέξη ή λιγότερους όρους.' : 'Try a different word or fewer terms.'}</div>
                    </div>
                `;
                return;
            }

            resultsEl.innerHTML = hits.map(it => `
                <a class="search-item" href="${resolveUrl(it.url)}" role="option">
                    <div class="search-item-title"><i class="fas fa-arrow-right"></i><span>${escapeHtml(it.title)}</span></div>
                    <div class="search-item-meta">${escapeHtml(it.meta)}</div>
                </a>
            `).join('');

            // Intercept clicks for smooth scroll on same page
            resultsEl.querySelectorAll('a.search-item').forEach(a => {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    const href = a.getAttribute('href');
                    if (!href) return;
                    setOverlayVisible(false);
                    setTimeout(() => navigate(href), 0);
                });
            });
        };

        const escapeHtml = (s) => (s || '').replace(/[&<>"']/g, (c) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));

        // Open / close events
        openBtn.addEventListener('click', () => setOverlayVisible(true));
        closeBtn.addEventListener('click', () => setOverlayVisible(false));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) setOverlayVisible(false); });

        input.addEventListener('input', () => renderResults(input.value.trim()));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setOverlayVisible(false);
        });

        // Keyboard shortcuts: Ctrl+K / Cmd+K, or "/" when not typing
        document.addEventListener('keydown', (e) => {
            const isMac = navigator.platform.toUpperCase().includes('MAC');
            const combo = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k';
            const slash = e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey;

            if (combo) {
                e.preventDefault();
                setOverlayVisible(true);
                return;
            }
            if (slash) {
                const tag = (document.activeElement && document.activeElement.tagName || '').toLowerCase();
                if (tag !== 'input' && tag !== 'textarea') {
                    e.preventDefault();
                    setOverlayVisible(true);
                }
            }
            if (e.key === 'Escape' && overlay.classList.contains('visible')) {
                e.preventDefault();
                setOverlayVisible(false);
            }
        });

        // Sync placeholder + aria strings on language changes
        window.__updateSearchLanguage = () => {
            const isGr = currentLanguage === 'gr';
            input.placeholder = isGr ? 'Αναζήτηση στον ιστότοπο...' : 'Search the site...';
            input.setAttribute('aria-label', isGr ? 'Αναζήτηση στον ιστότοπο' : 'Search the site');
            closeBtn.setAttribute('aria-label', isGr ? 'Κλείσιμο αναζήτησης' : 'Close search');
            // Refresh results text if open
            if (overlay.classList.contains('visible')) renderResults(input.value.trim());
        };
        window.__updateSearchLanguage();

        // If page is opened with #search=term, open the search
        try {
            const h = decodeURIComponent((window.location.hash || '').replace(/^#/, ''));
            if (h.startsWith('search=')) {
                const term = h.slice(7);
                setOverlayVisible(true);
                input.value = term;
                renderResults(term);
            }
        } catch (_) {}
    }

    // --- STATIC JSON ASSISTANT (GitHub Pages safe, no backend) ---


    function initializeAssistant() {
        if (document.querySelector('.assistant-shell')) return;

        const assistantPath = assetUrl('Assets/assistant.json');
        const recentTopicsKey = 'dedsec_assistant_recent_topics_v2';
        const shell = document.createElement('section');
        shell.className = 'assistant-shell';
        shell.setAttribute('aria-label', 'Assistant');
        shell.innerHTML = `
            <div class="assistant-panel" aria-hidden="true" id="dedsec-assistant-panel">
                <div class="assistant-header">
                    <div class="assistant-header-top">
                        <div class="assistant-title-wrap">
                            <h2 class="assistant-title"></h2>
                            <p class="assistant-subtitle"></p>
                        </div>
                        <div class="assistant-header-actions">
                            <button type="button" class="assistant-home" aria-label="Home">⌂</button>
                            <button type="button" class="assistant-refresh" aria-label="Refresh">↻</button>
                            <button type="button" class="assistant-close" aria-label="Close">✕</button>
                        </div>
                    </div>
                </div>
                <div class="assistant-body">
                    <div class="assistant-chat" role="log" aria-live="polite" aria-relevant="additions text">
                        <div class="assistant-messages"></div>
                    </div>
                </div>
            </div>
            <button type="button" class="assistant-trigger" aria-expanded="false" aria-controls="dedsec-assistant-panel">
                <span class="assistant-trigger-icon">✦</span>
                <span class="assistant-trigger-text"></span>
            </button>
        `;
        document.body.appendChild(shell);

        const panel = shell.querySelector('.assistant-panel');
        const trigger = shell.querySelector('.assistant-trigger');
        const homeBtn = shell.querySelector('.assistant-home');
        const refreshBtn = shell.querySelector('.assistant-refresh');
        const closeBtn = shell.querySelector('.assistant-close');
        const messagesWrap = shell.querySelector('.assistant-messages');
        const titleEl = shell.querySelector('.assistant-title');
        const subtitleEl = shell.querySelector('.assistant-subtitle');
        const triggerTextEl = shell.querySelector('.assistant-trigger-text');

        let assistantData = null;
        let assistantIndex = [];
        let typingTimer = null;
        let hasLoadedAssistant = false;
        let isFetchingAssistant = false;
        let lastPromptTapSignature = '';
        let lastPromptTapAt = 0;

        const getLang = () => (currentLanguage === 'gr' ? 'gr' : 'en');
        const t = (value, fallback = '') => {
            if (value && typeof value === 'object') return value[getLang()] || value.en || value.gr || fallback;
            return value || fallback;
        };
        const normalizeText = (value) => (value || '')
            .toString()
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        const tokenize = (value) => normalizeText(value)
            .replace(/[^\p{L}\p{N}.+-]+/gu, ' ')
            .split(' ')
            .map((token) => token.trim())
            .filter(Boolean);
        const escapeHtml = (value) => (value || '')
            .toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
        const ui = () => assistantData?.ui || {};
        const chatLabel = (role) => role === 'user' ? (currentLanguage === 'gr' ? 'Εσύ' : 'You') : 'Assistant';
        const typingLabel = () => (currentLanguage === 'gr' ? 'Ο Assistant γράφει…' : 'Assistant is typing…');
        const chatWrap = () => shell.querySelector('.assistant-chat');
        const scrollChatToBottom = () => {
            requestAnimationFrame(() => {
                const chat = chatWrap();
                if (chat) chat.scrollTop = chat.scrollHeight;
            });
        };
        const scrollMessageIntoView = (message, offset = 8) => {
            const apply = () => {
                const chat = chatWrap();
                if (!chat || !message) return;
                const targetTop = Math.max(0, (message.offsetTop || 0) - offset);
                chat.scrollTop = targetTop;
            };
            apply();
            requestAnimationFrame(() => {
                apply();
                requestAnimationFrame(apply);
            });
            window.setTimeout(apply, 60);
            window.setTimeout(apply, 180);
        };
        const clearTyping = () => {
            if (typingTimer) {
                clearTimeout(typingTimer);
                typingTimer = null;
            }
            messagesWrap.querySelectorAll('.assistant-message.is-typing').forEach((node) => node.remove());
        };
        const itemKey = (item) => normalizeText(t(item?.q, ''));
        const fileNameFromLink = (linkValue) => {
            const raw = (linkValue || '').toString().split('/').pop() || '';
            return raw.replace(/\.html?$/i, '').trim();
        };
        const safeLocalStorageGet = (key, fallback) => {
            try {
                const raw = localStorage.getItem(key);
                return raw ? JSON.parse(raw) : fallback;
            } catch (_) {
                return fallback;
            }
        };
        const safeLocalStorageSet = (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (_) {}
        };
        const getRecentTopics = () => {
            const items = safeLocalStorageGet(recentTopicsKey, []);
            return Array.isArray(items) ? items : [];
        };
        const saveRecentTopic = (entry) => {
            if (!entry || !entry.label || !entry.query) return;
            const current = getRecentTopics();
            const key = normalizeText(`${entry.label} ${entry.query} ${entry.itemKey || ''}`);
            const next = [entry, ...current.filter((item) => normalizeText(`${item.label} ${item.query} ${item.itemKey || ''}`) !== key)].slice(0, 8);
            safeLocalStorageSet(recentTopicsKey, next);
        };
        const removeSuggestionMessages = () => {
            messagesWrap.querySelectorAll('.assistant-message--suggestions').forEach((node) => node.remove());
        };
        const prettyItemLabel = (item) => {
            const fileTag = (item?.tags || []).find((tag) => /\.py$/i.test((tag || '').trim()));
            if (fileTag) return (fileTag || '').trim();
            const question = t(item?.q, '').trim();
            const patterns = [
                /^How do I install and use (.+?) in Termux\?$/i,
                /^What is (.+?)\?$/i,
                /^How do I (.+?)\?$/i,
                /^What are (.+?)\?$/i,
                /^Πώς να εγκαταστήσω και να χρησιμοποιήσω το (.+?) στο Termux;?$/i,
                /^Τι είναι το (.+?)\?$/i,
                /^Πώς (.+?)\?$/i,
                /^Ποιες είναι (.+?)\?$/i
            ];
            for (const pattern of patterns) {
                const match = question.match(pattern);
                if (match && match[1]) return match[1].trim();
            }
            return question;
        };
        const computeBigrams = (value) => {
            const normalized = ` ${normalizeText(value)} `;
            const grams = [];
            for (let i = 0; i < normalized.length - 1; i += 1) grams.push(normalized.slice(i, i + 2));
            return grams;
        };
        const diceCoefficient = (a, b) => {
            const aGrams = computeBigrams(a);
            const bGrams = computeBigrams(b);
            if (!aGrams.length || !bGrams.length) return 0;
            const counts = new Map();
            aGrams.forEach((gram) => counts.set(gram, (counts.get(gram) || 0) + 1));
            let matches = 0;
            bGrams.forEach((gram) => {
                const count = counts.get(gram) || 0;
                if (count > 0) {
                    counts.set(gram, count - 1);
                    matches += 1;
                }
            });
            return (2 * matches) / (aGrams.length + bGrams.length);
        };
        const expandQueryAliases = (query) => {
            const norm = normalizeText(query);
            const variants = new Set([norm]);
            const replacements = [
                [/\bsetup\b/g, 'install'],
                [/\binstallation\b/g, 'install'],
                [/\bguide\b/g, 'help'],
                [/\bcommands\b/g, 'command'],
                [/\btools\b/g, 'tool'],
                [/\bpages\b/g, 'page'],
                [/\bdownloads\b/g, 'download'],
                [/\bfiles\b/g, 'file'],
                [/\bστοιχεια\b/g, 'στοιχεία'],
                [/\bεντολες\b/g, 'εντολές'],
                [/\bεγκατασταση\b/g, 'εγκατάσταση'],
                [/\bβοηθεια\b/g, 'βοήθεια'],
                [/\bαρχεια\b/g, 'αρχεία']
            ];
            replacements.forEach(([pattern, replacement]) => {
                variants.add(norm.replace(pattern, replacement));
            });
            tokenize(norm).forEach((token) => variants.add(token));
            return Array.from(variants).filter(Boolean);
        };
        const commandRegex = /(?:\b(?:pkg|apt|python|python3|pip|pip3|git|cd|ls|pwd|mkdir|rm|cp|mv|cat|nano|unzip|zip|chmod|termux-setup-storage|curl|wget|find|clear)\b[^\n<]*)/gi;
        const highlightCommands = (text) => {
            const raw = (text || '').toString();
            let html = '';
            let lastIndex = 0;
            raw.replace(commandRegex, (match, offset) => {
                html += escapeHtml(raw.slice(lastIndex, offset));
                html += `<code class="assistant-inline-code">${escapeHtml(match.trim())}</code>`;
                lastIndex = offset + match.length;
                return match;
            });
            html += escapeHtml(raw.slice(lastIndex));
            return html;
        };
        const linkifyUrls = (html) => (html || '').replace(/(^|[\s>(])((https?:\/\/|www\.)[^\s<]+)/gi, (full, prefix, rawUrl) => {
            const cleanUrl = (rawUrl || '').replace(/[),.;!?]+$/g, '');
            const trailing = (rawUrl || '').slice(cleanUrl.length);
            const href = cleanUrl.startsWith('www.') ? `https://${cleanUrl}` : cleanUrl;
            return `${prefix}<a class="assistant-inline-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(cleanUrl)}</a>${escapeHtml(trailing)}`;
        });
        const formatRichText = (text) => linkifyUrls(highlightCommands(text || ''));
        const splitAnswerIntoSections = (text) => {
            const raw = (text || '').toString().trim();
            if (!raw) return [];
            const labels = [
                'What it does:', 'Install/run in Termux:', 'Output or save location:', 'Warning:', 'Note:', 'Quick fix:', 'Main idea:',
                'Τι κάνει:', 'Εγκατάσταση/εκτέλεση στο Termux:', 'Τοποθεσία εξόδου ή αποθήκευσης:', 'Προειδοποίηση:', 'Σημείωση:', 'Γρήγορη λύση:', 'Κύρια ιδέα:'
            ];
            let marked = raw;
            labels.forEach((label) => {
                const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                marked = marked.replace(new RegExp(escaped, 'g'), `\n@@SECTION@@${label}`);
            });
            const parts = marked.split('@@SECTION@@').map((part) => part.trim()).filter(Boolean);
            return parts.map((part, index) => {
                const label = labels.find((candidate) => part.startsWith(candidate));
                if (!label) {
                    return {
                        title: index === 0 ? (currentLanguage === 'gr' ? 'Απάντηση' : 'Answer') : '',
                        body: part
                    };
                }
                return {
                    title: label.replace(/:$/, ''),
                    body: part.slice(label.length).trim()
                };
            });
        };
        const formatAnswerHtml = (text) => {
            const sections = splitAnswerIntoSections(text);
            if (!sections.length) return `<p class="assistant-bubble-text">${formatRichText(text || '')}</p>`;
            return sections.map((section) => {
                const bodyHtml = (section.body || '')
                    .split(/\n{2,}/)
                    .map((paragraph) => `<p class="assistant-bubble-text">${formatRichText(paragraph)}</p>`)
                    .join('');
                return `
                    <section class="assistant-rich-section">
                        ${section.title ? `<h4 class="assistant-rich-section-title">${escapeHtml(section.title)}</h4>` : ''}
                        <div class="assistant-rich-section-body">${bodyHtml}</div>
                    </section>
                `;
            }).join('');
        };
        const categoryBadge = (item) => item?._categoryLabel ? (currentLanguage === 'gr' ? `Κατηγορία: ${item._categoryLabel}` : `Category: ${item._categoryLabel}`) : '';
        const createMessage = (role, text, options = {}) => {
            const message = document.createElement('article');
            message.className = `assistant-message assistant-message--${role}`;
            if (options.extraClass) message.classList.add(options.extraClass);
            if (options.typing) message.classList.add('is-typing');

            const label = document.createElement('div');
            label.className = 'assistant-message-label';
            label.textContent = options.label || chatLabel(role);
            message.appendChild(label);

            const bubble = document.createElement('div');
            bubble.className = 'assistant-bubble';

            if (options.heading) {
                const heading = document.createElement('h3');
                heading.className = 'assistant-bubble-heading';
                heading.textContent = options.heading;
                bubble.appendChild(heading);
            }

            if (options.typing) {
                const typing = document.createElement('div');
                typing.className = 'assistant-typing';
                typing.setAttribute('aria-label', typingLabel());
                typing.innerHTML = '<span></span><span></span><span></span>';
                bubble.appendChild(typing);
            } else if (options.html) {
                const rich = document.createElement('div');
                rich.className = 'assistant-bubble-rich';
                rich.innerHTML = options.html;
                bubble.appendChild(rich);
            } else {
                const body = document.createElement('p');
                body.className = 'assistant-bubble-text';
                body.textContent = text || '';
                bubble.appendChild(body);
            }

            if (options.meta) {
                const meta = document.createElement('div');
                meta.className = 'assistant-bubble-meta';
                meta.textContent = options.meta;
                bubble.appendChild(meta);
            }

            if (options.linkHref) {
                const href = (options.linkHref || '').trim();
                if (href) {
                    const link = document.createElement('a');
                    link.className = 'assistant-open-link';
                    link.href = href;
                    if (/^https?:\/\//i.test(href)) {
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                    }
                    link.textContent = options.linkText || t(ui().openPage, 'Open page');
                    bubble.appendChild(link);
                }
            }

            message.appendChild(bubble);
            messagesWrap.appendChild(message);
            if (!options.noAutoScroll) scrollChatToBottom();
            return message;
        };
        const renderPromptSections = (sections = []) => {
            const validSections = sections.filter((section) => Array.isArray(section.prompts) && section.prompts.length);
            if (!validSections.length) {
                return `<div class="assistant-empty">${escapeHtml(t(ui().empty, 'No quick prompts are available right now.'))}</div>`;
            }
            return validSections.map((section) => `
                <section class="assistant-suggestion-section">
                    ${section.title ? `<h4 class="assistant-suggestion-title">${escapeHtml(section.title)}</h4>` : ''}
                    <div class="assistant-chip-grid">
                        ${section.prompts.map((prompt) => `
                            <button
                                type="button"
                                class="assistant-chip"
                                data-query="${escapeHtml(prompt.query || '')}"
                                data-label="${escapeHtml(prompt.label || prompt.query || '')}"
                                data-item-key="${escapeHtml(prompt.itemKey || '')}"
                            >${escapeHtml(prompt.label || prompt.query || '')}</button>
                        `).join('')}
                    </div>
                </section>
            `).join('');
        };
        const bindPromptClicks = () => {
            shell.querySelectorAll('.assistant-chip').forEach((btn) => {
                if (btn.dataset.assistantBound === '1') return;
                btn.dataset.assistantBound = '1';
                btn.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const itemKeyValue = btn.dataset.itemKey || '';
                    const promptLabel = btn.dataset.label || btn.textContent || '';
                    const promptQuery = btn.dataset.query || promptLabel;
                    const tapSignature = normalizeText(`${promptLabel} ${promptQuery} ${itemKeyValue}`);
                    const now = Date.now();
                    if (tapSignature && tapSignature === lastPromptTapSignature && (now - lastPromptTapAt) < 650) {
                        return;
                    }
                    lastPromptTapSignature = tapSignature;
                    lastPromptTapAt = now;
                    if (itemKeyValue) {
                        const item = assistantIndex.find((entry) => entry._key === itemKeyValue);
                        if (item) {
                            respondWithAnswer(item, promptLabel);
                            return;
                        }
                    }
                    handleUserQuery(promptQuery, promptLabel);
                });
            });
        };
        const pushSuggestions = (heading, sections, bodyText = '', options = {}) => {
            removeSuggestionMessages();
            createMessage('assistant', '', {
                heading,
                html: `${bodyText ? `<p class="assistant-bubble-text">${escapeHtml(bodyText)}</p>` : ''}${renderPromptSections(sections)}`,
                extraClass: 'assistant-message--suggestions',
                noAutoScroll: !!options.noAutoScroll
            });
            bindPromptClicks();
        };
        const dedupePrompts = (prompts) => {
            const seen = new Set();
            return prompts.filter((entry) => {
                const key = normalizeText(`${entry.label} ${entry.query} ${entry.itemKey || ''}`);
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        };
        const starterPrompts = () => {
            const configured = Array.isArray(assistantData?.starterPrompts) ? assistantData.starterPrompts : [];
            if (configured.length) {
                return dedupePrompts(configured.map((entry) => ({
                    label: t(entry.label, entry.query || ''),
                    query: entry.query || t(entry.label, '')
                }))).slice(0, 8);
            }
            return dedupePrompts(assistantIndex.slice(0, 8).map((item) => ({
                label: prettyItemLabel(item),
                query: item._question,
                itemKey: item._key
            })));
        };
        const categoryPrompts = () => dedupePrompts((assistantData?.categories || []).map((category) => ({
            label: t(category.label, ''),
            query: t(category.label, '')
        }))).slice(0, 10);
        const recentPrompts = () => dedupePrompts(getRecentTopics()).slice(0, 5);
        const buildIndex = () => {
            assistantIndex = [];
            for (const category of assistantData?.categories || []) {
                const categoryLabel = t(category.label, '');
                const categoryNorm = normalizeText(categoryLabel);
                for (const item of category.items || []) {
                    const question = t(item.q, '');
                    const answer = t(item.a, '');
                    const pretty = prettyItemLabel(item);
                    const link = t(item.link, '');
                    const fileName = fileNameFromLink(link);
                    const tags = (item.tags || []).map((tag) => normalizeText(tag));
                    const aliasNorms = dedupePrompts([
                        { label: pretty, query: pretty },
                        { label: fileName, query: fileName },
                        { label: fileName.replace(/\.py$/i, ''), query: fileName.replace(/\.py$/i, '') },
                        ...(item.tags || []).map((tag) => ({ label: tag, query: tag }))
                    ]).map((entry) => normalizeText(entry.query || entry.label));
                    assistantIndex.push({
                        ...item,
                        _categoryLabel: categoryLabel,
                        _categoryNorm: categoryNorm,
                        _question: question,
                        _questionNorm: normalizeText(question),
                        _answerNorm: normalizeText(answer),
                        _prettyNorm: normalizeText(pretty),
                        _tagsNorm: tags,
                        _aliasesNorm: aliasNorms,
                        _linkNorm: normalizeText(link),
                        _fileNameNorm: normalizeText(fileName),
                        _tokens: new Set(tokenize([question, answer, pretty, categoryLabel, link, fileName, ...(item.tags || [])].join(' '))),
                        _key: itemKey(item)
                    });
                }
            }
        };
        const scoreItemForQuery = (query, item) => {
            const queryNorm = normalizeText(query);
            const queryTokens = tokenize(queryNorm);
            const queryVariants = expandQueryAliases(queryNorm);
            if (!queryNorm) return 0;

            let score = 0;
            const genericSingles = new Set(['termux', 'install', 'python', 'script', 'commands', 'tools', 'pages', 'project', 'guide', 'help']);
            const hasGenericSingleToken = queryTokens.length === 1 && genericSingles.has(queryTokens[0]);

            queryVariants.forEach((variant) => {
                if (item._questionNorm === variant) score += 180;
                if (item._key === variant) score += 185;
                if (item._prettyNorm === variant) score += 178;
                if (item._fileNameNorm === variant) score += 176;
                if (item._aliasesNorm.includes(variant)) score += 132;
                if (item._tagsNorm.includes(variant)) score += 126;
                if (item._categoryNorm === variant) score += 98;

                if (item._questionNorm.includes(variant) && item._questionNorm !== variant) score += 58;
                if (item._prettyNorm.includes(variant) && item._prettyNorm !== variant) score += 74;
                if (item._fileNameNorm.includes(variant) && item._fileNameNorm !== variant) score += 68;
                if (item._categoryNorm.includes(variant) && item._categoryNorm !== variant) score += 28;
                if (item._answerNorm.includes(variant)) score += 16;
                item._aliasesNorm.forEach((alias) => {
                    if (alias && (alias.includes(variant) || variant.includes(alias))) score += 30;
                });
                item._tagsNorm.forEach((tag) => {
                    if (tag && (tag.includes(variant) || variant.includes(tag))) score += 24;
                });
            });

            queryTokens.forEach((token) => {
                if (item._tokens.has(token)) score += 12;
                if (item._questionNorm.includes(token)) score += 8;
                if (item._prettyNorm.includes(token)) score += 14;
                if (item._fileNameNorm.includes(token)) score += 16;
                if (item._tagsNorm.some((tag) => tag.includes(token))) score += 10;
            });

            const similarity = Math.max(
                diceCoefficient(queryNorm, item._questionNorm),
                diceCoefficient(queryNorm, item._prettyNorm),
                diceCoefficient(queryNorm, item._fileNameNorm)
            );
            score += Math.round(similarity * 80);

            if (queryTokens.length > 1 && queryTokens.every((token) => item._tokens.has(token) || item._questionNorm.includes(token) || item._prettyNorm.includes(token) || item._tagsNorm.some((tag) => tag.includes(token)))) {
                score += 34;
            }
            if (hasGenericSingleToken) score -= 16;
            return score;
        };
        const searchMatches = (query, limit = 8) => {
            const scored = assistantIndex
                .map((item) => ({ item, score: scoreItemForQuery(query, item) }))
                .filter((entry) => entry.score > 0)
                .sort((a, b) => b.score - a.score || a.item._question.localeCompare(b.item._question));
            return scored.slice(0, limit);
        };
        const categoryMatchesForQuery = (query) => {
            const queryNorm = normalizeText(query);
            if (!queryNorm) return [];
            const exact = (assistantData?.categories || []).find((category) => normalizeText(t(category.label, '')) === queryNorm);
            if (exact) return exact.items || [];
            const loose = (assistantData?.categories || []).find((category) => {
                const categoryNorm = normalizeText(t(category.label, ''));
                return categoryNorm && (categoryNorm.includes(queryNorm) || queryNorm.includes(categoryNorm) || diceCoefficient(queryNorm, categoryNorm) >= 0.72);
            });
            return loose ? (loose.items || []) : [];
        };
        const relatedPromptsForItem = (item) => {
            const siblings = assistantIndex
                .filter((entry) => entry._categoryNorm === item._categoryNorm && entry._key !== item._key)
                .slice(0, 4)
                .map((entry) => ({
                    label: prettyItemLabel(entry),
                    query: entry._question,
                    itemKey: entry._key
                }));
            return dedupePrompts([...siblings, ...starterPrompts(), ...recentPrompts()]).slice(0, 8);
        };
        const startSections = () => {
            const sections = [];
            const recent = recentPrompts();
            if (recent.length) {
                sections.push({
                    title: currentLanguage === 'gr' ? 'Πρόσφατα θέματα' : 'Recent topics',
                    prompts: recent
                });
            }
            sections.push({
                title: currentLanguage === 'gr' ? 'Δημοφιλείς βοήθειες' : 'Popular help',
                prompts: starterPrompts()
            });
            sections.push({
                title: currentLanguage === 'gr' ? 'Κατηγορίες' : 'Categories',
                prompts: categoryPrompts()
            });
            return sections;
        };
        const renderStartState = () => {
            clearTyping();
            messagesWrap.innerHTML = '';
            createMessage('assistant', t(ui().welcomeBody, currentLanguage === 'gr' ? 'Πάτησε μία λέξη, ένα όνομα script ή μία κατηγορία και θα βρω την πιο σχετική απάντηση από τα δεδομένα του site.' : 'Tap a word, a script name, or a category and I will match it to the closest answer from the site data.'), {
                heading: t(ui().welcomeTitle, currentLanguage === 'gr' ? 'Πώς μπορώ να βοηθήσω σήμερα;' : 'How can I help today?'),
                meta: assistantData?.updated ? `${t(ui().updatedPrefix, 'Updated')}: ${assistantData.updated}` : ''
            });
            pushSuggestions(
                t(ui().promptHeading, currentLanguage === 'gr' ? 'Διάλεξε θέμα' : 'Choose a topic'),
                startSections(),
                t(ui().promptBody, currentLanguage === 'gr' ? 'Μπορείς να πατήσεις ένα όνομα script, μία λέξη ή μία κατηγορία. Θα απαντήσω ή θα σου δείξω τα πιο σχετικά αποτελέσματα.' : 'You can tap a script name, a keyword, or a category. I will answer directly or show the closest results.')
            );
        };
        const renderNoMatch = (promptLabel) => {
            createMessage('assistant', t(ui().noMatchBody, currentLanguage === 'gr' ? 'Δεν βρήκα ακόμη καθαρό ταίριασμα γι’ αυτό το prompt.' : 'I could not find a clean match for that prompt yet.'), {
                heading: t(ui().noMatchTitle, currentLanguage === 'gr' ? 'Δεν βρήκα ακριβή απάντηση' : 'I could not find an exact answer')
            });
            pushSuggestions(
                t(ui().promptHeading, currentLanguage === 'gr' ? 'Δοκίμασε κάτι σχετικό' : 'Try something related'),
                startSections(),
                promptLabel ? (currentLanguage === 'gr' ? `Το "${promptLabel}" δεν έδωσε σαφές αποτέλεσμα.` : `“${promptLabel}” did not give a clear result.`) : ''
            );
        };
        const showMatchChoices = (queryLabel, matches) => {
            const prompts = matches.map(({ item }) => ({
                label: prettyItemLabel(item),
                query: item._question,
                itemKey: item._key
            }));
            createMessage('assistant', t(ui().disambiguationBody, currentLanguage === 'gr' ? 'Βρήκα αρκετά σχετικά αποτελέσματα. Διάλεξε αυτό που ταιριάζει καλύτερα.' : 'I found several related results. Pick the one that fits best.'), {
                heading: t(ui().disambiguationTitle, currentLanguage === 'gr' ? 'Βρήκα σχετικά θέματα' : 'I found related topics')
            });
            pushSuggestions(
                currentLanguage === 'gr' ? 'Διάλεξε αποτέλεσμα' : 'Choose a result',
                [{
                    title: queryLabel ? (currentLanguage === 'gr' ? `Αποτελέσματα για: ${queryLabel}` : `Results for: ${queryLabel}`) : '',
                    prompts
                }],
                currentLanguage === 'gr' ? 'Πάτησε το πιο σωστό αποτέλεσμα.' : 'Tap the best matching result.'
            );
        };
        const respondWithAnswer = (item, promptLabel = '', options = {}) => {
            if (!item) return;
            removeSuggestionMessages();
            const userLabel = promptLabel || prettyItemLabel(item);
            if (!options.suppressUserMessage) {
                createMessage('user', userLabel);
            }
            saveRecentTopic({ label: userLabel, query: item._question, itemKey: item._key });
            clearTyping();
            const typingMessage = createMessage('assistant', '', { typing: true });
            const delay = Math.min(1400, Math.max(420, t(item.a, '').length * 5));
            typingTimer = window.setTimeout(() => {
                typingMessage.remove();
                typingTimer = null;
                const answerMessage = createMessage('assistant', '', {
                    heading: t(item.q, ''),
                    html: formatAnswerHtml(t(item.a, '')),
                    meta: [assistantData?.updated ? `${t(ui().updatedPrefix, 'Updated')}: ${assistantData.updated}` : '', categoryBadge(item)].filter(Boolean).join(' • '),
                    linkHref: t(item.link, ''),
                    linkText: t(ui().openPage, 'Open page'),
                    noAutoScroll: true
                });
                const related = relatedPromptsForItem(item);
                if (related.length) {
                    pushSuggestions(
                        currentLanguage === 'gr' ? 'Χρειάζεσαι βοήθεια με κάτι άλλο;' : 'Do you need help with anything else?',
                        [{
                            title: currentLanguage === 'gr' ? 'Σχετικά θέματα' : 'Related topics',
                            prompts: related
                        }],
                        currentLanguage === 'gr' ? 'Πάτησε κάτι σχετικό ή γύρνα στην αρχή με το κουμπί ⌂.' : 'Tap something related or go back to start with the ⌂ button.',
                        { noAutoScroll: true }
                    );
                } else {
                    createMessage('assistant', currentLanguage === 'gr' ? 'Χρειάζεσαι βοήθεια με κάτι άλλο; Πάτησε το ⌂ για νέα αρχή.' : 'Do you need help with anything else? Tap ⌂ to start a new topic.', {
                        heading: currentLanguage === 'gr' ? 'Χρειάζεσαι βοήθεια με κάτι άλλο;' : 'Do you need help with anything else?',
                        noAutoScroll: true
                    });
                }
                scrollMessageIntoView(answerMessage, 6);
            }, delay);
        };
        const handleUserQuery = (query, promptLabel = '') => {
            if (!assistantData) return;
            const cleanQuery = (query || '').trim();
            if (!cleanQuery) return;
            removeSuggestionMessages();
            createMessage('user', promptLabel || cleanQuery);
            saveRecentTopic({ label: promptLabel || cleanQuery, query: cleanQuery });
            clearTyping();
            const typingMessage = createMessage('assistant', '', { typing: true });
            const delay = Math.min(1100, Math.max(380, cleanQuery.length * 20));
            typingTimer = window.setTimeout(() => {
                typingMessage.remove();
                typingTimer = null;

                const categoryItems = categoryMatchesForQuery(cleanQuery);
                if (categoryItems.length >= 2) {
                    const scoredCategoryItems = categoryItems
                        .map((item) => assistantIndex.find((entry) => entry._key === itemKey(item)))
                        .filter(Boolean)
                        .map((item) => ({ item, score: 100 }));
                    showMatchChoices(promptLabel || cleanQuery, scoredCategoryItems.slice(0, 8));
                    return;
                }

                const matches = searchMatches(cleanQuery, 8);
                if (!matches.length || matches[0].score < 26) {
                    renderNoMatch(promptLabel || cleanQuery);
                    return;
                }

                const top = matches[0];
                const second = matches[1];
                const directAnswer = top.score >= 122 || (top.score >= 88 && (!second || (top.score - second.score) >= 20));
                if (directAnswer) {
                    respondWithAnswer(top.item, promptLabel || cleanQuery, { suppressUserMessage: true });
                    return;
                }

                showMatchChoices(promptLabel || cleanQuery, matches.slice(0, 6));
            }, delay);
        };
        const applyUiStrings = () => {
            titleEl.textContent = t(ui().title, 'DedSec Assistant');
            subtitleEl.textContent = t(ui().subtitle, currentLanguage === 'gr' ? 'Chat style · έξυπνα matches · καλύτερες απαντήσεις' : 'Chat style · smarter matches · better answers');
            triggerTextEl.textContent = t(ui().buttonLabel, 'Assistant');
            trigger.setAttribute('aria-label', t(ui().buttonLabel, 'Assistant'));
            homeBtn.setAttribute('aria-label', currentLanguage === 'gr' ? 'Αρχή' : 'Home');
            refreshBtn.setAttribute('aria-label', t(ui().refresh, 'Refresh'));
            closeBtn.setAttribute('aria-label', t(ui().close, 'Close'));
        };
        const refreshAssistantData = async (force = false) => {
            if (isFetchingAssistant) return;
            if (hasLoadedAssistant && !force && assistantData) {
                applyUiStrings();
                if (!messagesWrap.children.length) renderStartState();
                return;
            }
            isFetchingAssistant = true;
            const loadingText = t(ui().loading, currentLanguage === 'gr' ? 'Φόρτωση δεδομένων βοηθού...' : 'Loading assistant data...');
            messagesWrap.innerHTML = '';
            createMessage('assistant', loadingText, {
                heading: t(ui().title, 'DedSec Assistant')
            });
            try {
                const response = await fetch(assistantPath, { cache: force ? 'no-store' : 'default' });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                assistantData = await response.json();
                buildIndex();
                applyUiStrings();
                hasLoadedAssistant = true;
                renderStartState();
            } catch (error) {
                assistantData = null;
                assistantIndex = [];
                hasLoadedAssistant = false;
                applyUiStrings();
                clearTyping();
                messagesWrap.innerHTML = '';
                createMessage('assistant', t(ui().loadError, 'Assistant data could not be loaded right now.'), {
                    heading: t(ui().title, 'DedSec Assistant')
                });
            } finally {
                isFetchingAssistant = false;
            }
        };
        const resetAssistant = () => {
            if (!assistantData) {
                refreshAssistantData(true);
                return;
            }
            buildIndex();
            renderStartState();
        };
        const setOpen = (open) => {
            shell.classList.toggle('open', open);
            document.body.classList.toggle('assistant-open', open);
            document.documentElement.classList.toggle('assistant-open', open);
            panel.setAttribute('aria-hidden', open ? 'false' : 'true');
            trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (open) {
                refreshAssistantData(false).finally(() => {
                    setTimeout(() => closeBtn.focus({ preventScroll: true }), 40);
                });
            } else {
                clearTyping();
            }
        };


        const navMenu = document.getElementById('nav-menu');
        if (navMenu && !navMenu.querySelector('.nav-link-assistant')) {
            const assistantNavBtn = document.createElement('button');
            assistantNavBtn.type = 'button';
            assistantNavBtn.className = 'nav-link nav-link-assistant';
            assistantNavBtn.setAttribute('data-en', 'Assistant');
            assistantNavBtn.setAttribute('data-gr', 'Βοηθός');
            assistantNavBtn.textContent = currentLanguage === 'gr' ? 'Βοηθός' : 'Assistant';
            assistantNavBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                document.body.classList.remove('menu-open');
                document.getElementById('burger-menu')?.classList.remove('active');
                document.getElementById('nav-menu')?.classList.remove('active');
                document.getElementById('burger-menu')?.setAttribute('aria-expanded', 'false');
                requestAnimationFrame(() => setOpen(true));
            });
            navMenu.appendChild(assistantNavBtn);
        }

        trigger.addEventListener('click', () => setOpen(!shell.classList.contains('open')));
        closeBtn.addEventListener('click', () => setOpen(false));
        homeBtn.addEventListener('click', () => resetAssistant());
        refreshBtn.addEventListener('click', () => refreshAssistantData(true));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && shell.classList.contains('open')) setOpen(false);
        });
        document.addEventListener('click', (e) => {
            if (!shell.classList.contains('open')) return;
            const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
            if (path.includes(shell) || shell.contains(e.target)) return;
            setOpen(false);
        });

        window.__updateAssistantLanguage = () => {
            applyUiStrings();
            if (!assistantData) {
                messagesWrap.innerHTML = '';
                createMessage('assistant', currentLanguage === 'gr' ? 'Άνοιξε το παράθυρο για να φορτώσει ο βοηθός.' : 'Open the panel to load the assistant.', {
                    heading: 'Assistant'
                });
                return;
            }
            buildIndex();
            renderStartState();
        };

        applyUiStrings();
        messagesWrap.innerHTML = '';
        createMessage('assistant', currentLanguage === 'gr' ? 'Άνοιξε το παράθυρο για να φορτώσει ο βοηθός.' : 'Open the panel to load the assistant.', {
            heading: 'Assistant'
        });
    }


    // Small UX + SEO fixes
    function initializeBrandingAndLinks() {
        // Add logo in navbar title (without changing HTML files)
        document.querySelectorAll('.nav-title h1').forEach(h1 => {
            if (h1.querySelector('img')) return;
            const img = document.createElement('img');
            img.alt = 'DedSec Project';
            img.width = 34;
            img.height = 34;
            img.loading = 'eager';
            img.decoding = 'async';
            img.style.borderRadius = '10px';
            img.style.border = '1px solid var(--nm-border)';
            img.style.background = 'rgba(255,255,255,0.04)';
            img.setAttribute('data-site-logo','1');
            img.src = getThemeLogo();
            h1.prepend(img);
        });

        // Ensure target=_blank links are safe
        document.querySelectorAll('a[target="_blank"]').forEach(a => {
            const rel = (a.getAttribute('rel') || '').toLowerCase();
            if (!rel.includes('noopener')) a.setAttribute('rel', (rel ? rel + ' ' : '') + 'noopener noreferrer');
        });

        // Fix broken local favicon paths by forcing a working icon
        const ensureIcon = () => {
            let link = document.querySelector('link[rel="icon"]');
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                link.type = 'image/jpeg';
                document.head.appendChild(link);
            }
            link.href = getThemeLogo();
        };
        ensureIcon();
        applyThemeAssets();
    }

    // --- DEEP-LINK ANCHORS (Deterministic IDs) ---

    function initializeBackToTop() {
        if (document.querySelector('.back-to-top-trigger')) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'back-to-top-trigger';
        button.setAttribute('aria-label', currentLanguage === 'gr' ? 'Επιστροφή στην κορυφή' : 'Back to top');
        button.setAttribute('title', currentLanguage === 'gr' ? 'Κορυφή' : 'Top');
        button.innerHTML = '<span class="back-to-top-icon" aria-hidden="true">↑</span>';
        document.body.appendChild(button);

        const syncVisibility = () => {
            const show = (window.scrollY || window.pageYOffset || 0) > 120;
            button.classList.toggle('visible', show);
        };

        button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', syncVisibility, { passive: true });
        window.addEventListener('resize', syncVisibility, { passive: true });
        syncVisibility();
    }


    function initializePageTransitions() {}

    function initializeDeepLinks() {
        const slugifyLocal = (str) => {
            return (str || '')
                .toString()
                .normalize('NFKD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                .slice(0, 64) || 'section';
        };

        const scope = document.querySelector('main') || document.body;
        if (!scope) return;

        const candidates = scope.querySelectorAll('h1, h2, h3, h4, .feature-title, .tool-title, .category-header');
        const used = new Set();

        candidates.forEach((el) => {
            const raw = (el.getAttribute('data-en') || el.textContent || '').trim();
            if (!raw) return;
            if (el.id) { used.add(el.id); return; }

            const base = slugifyLocal(raw);
            let unique = base;
            let n = 2;
            while (used.has(unique) || document.getElementById(unique)) {
                unique = `${base}-${n++}`;
            }
            el.id = unique;
            used.add(unique);
        });
        const openAncestors = (el) => {
            if (!el) return;
            // Tool / FAQ accordions
            const toolItem = el.closest?.('.tool-item');
            if (toolItem) toolItem.classList.add('active');
            const category = el.closest?.('.category');
            if (category) category.classList.add('active');

            // Generic accordions / details
            const details = el.closest?.('details');
            if (details) details.open = true;
        };

        const scrollToHash = (behavior = 'smooth') => {
            if (!window.location.hash) return;
            const targetId = decodeURIComponent(window.location.hash.slice(1));
            const el = document.getElementById(targetId);
            if (!el) return;
            openAncestors(el);
            // Wait a frame so expanded content is measurable, then scroll
            requestAnimationFrame(() => {
                try {
                    el.scrollIntoView({ behavior, block: 'start' });
                } catch {
                    el.scrollIntoView();
                }
            });
        };

        // If we loaded a page with a hash, open + scroll after IDs exist
        scrollToHash('smooth');
        window.addEventListener('hashchange', () => scrollToHash('smooth'));
    }

// --- MAIN INIT ---
    function init() {
        initializeNavigation();
        initializePageTransitions();
        initializeDeepLinks();
        initializeThemeSwitcher();
        initializeBrandingAndLinks();
        initializeSearch();
        initializeCarousels();
        initializeToolCategories('.categories-container');
        initializeToolCategories('#faq-container');
        initializeAssistant();
        initializeBackToTop();
        
        // Language Switcher (Navbar)
        document.getElementById('nav-lang-switcher')?.addEventListener('click', () => {
            window.changeLanguage(currentLanguage === 'en' ? 'gr' : 'en');
        });

        // Modals
        document.querySelectorAll('.modal-overlay').forEach(m => {
            m.addEventListener('click', (e) => { if(e.target === m ) m.classList.remove('visible'); });
            m.querySelector('.close-modal')?.addEventListener('click', () => m.classList.remove('visible'));
        });

        // Final Setup
        window.changeLanguage(localStorage.getItem('language') || 'en');

        // Keep viewport + navbar size variables synced (mobile Safari + dynamic nav height)
        const layoutHandler = () => syncLayoutVars();
        layoutHandler();
        window.addEventListener('resize', layoutHandler, { passive: true });
        window.addEventListener('orientationchange', layoutHandler, { passive: true });
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', layoutHandler);
            window.visualViewport.addEventListener('scroll', layoutHandler);
        }

        // Defer large disclaimer DOM injection so first paint on mobile is faster
        const defer = (fn) => {
            if (typeof fn !== 'function') return;
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => fn(), { timeout: 1200 });
            } else {
                setTimeout(() => fn(), 250);
            }
        };
        // Active Link
        const page = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.getAttribute('href').includes(page)));

        // Reveal animations removed for maximum speed
    }

    init();
});