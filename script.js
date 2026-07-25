/* ============================================================================
   MAINTENANCE (DedSec Project)
   - Theme + language persistence is handled here (localStorage).
   - If assets break on sub-pages, check SITE_BASE resolver at the top.
   - NAV highlights & mobile menu behaviors are also here.
   ============================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL STATE ---
    const pageLanguage = (/\/el(?:\/|$)/.test(window.location.pathname)) ? 'gr' : 'en';
    let currentLanguage = pageLanguage;

    // --- NAV WORD STACK + MENU OFFSET (keeps navbar compact so logo stays visible) ---
    const applyNavbarWordStack = () => {
        // Only for the navbar labels (and title). We don't want to affect normal body text.
        const targets = document.querySelectorAll(
            '.main-nav .nav-title .site-title, .main-nav .nav-action-label, .main-nav .burger-label'
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

    const refreshCompactNavButtons = () => {
        const themeBtn = document.getElementById('nav-theme-switcher');
        const themeLabel = themeBtn?.querySelector('.nav-theme-label');
        const isLight = document.body.classList.contains('light-theme');
        if (themeLabel) {
            themeLabel.textContent = isLight ? (themeLabel.dataset.dark || '☾') : (themeLabel.dataset.light || '☀');
        }
        if (themeBtn) {
            themeBtn.setAttribute('aria-label', currentLanguage === 'gr' ? (isLight ? 'Ενεργοποίηση σκούρου θέματος' : 'Ενεργοποίηση ανοιχτού θέματος') : (isLight ? 'Switch to dark theme' : 'Switch to light theme'));
            themeBtn.title = isLight ? 'Dark' : 'Light';
        }

        const langBtn = document.getElementById('nav-lang-switcher');
        const langLabel = langBtn?.querySelector('.nav-lang-label');
        if (langLabel) {
            langLabel.textContent = currentLanguage === 'en' ? (langLabel.dataset.en || 'ΕΛ') : (langLabel.dataset.gr || 'EN');
        }
        if (langBtn) {
            langBtn.setAttribute('aria-label', currentLanguage === 'en' ? 'Change language to Greek' : 'Αλλαγή γλώσσας στα Αγγλικά');
            langBtn.title = currentLanguage === 'en' ? 'ΕΛ' : 'EN';
        }
    };
    // --- NAVIGATION FUNCTIONALITY ---
    function initializeNavigation() {
        const burgerMenu = document.getElementById('burger-menu');
        const navMenu = document.getElementById('nav-menu');
        
        if (burgerMenu && navMenu) {
            burgerMenu.addEventListener('click', () => {
                burgerMenu.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                burgerMenu?.classList.remove('active');
                navMenu?.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (navMenu?.classList.contains('active')) {
                const navActions = document.querySelector('.nav-actions');
                if (!navMenu.contains(e.target) && !burgerMenu?.contains(e.target) && !navActions?.contains(e.target)) {
                    burgerMenu?.classList.remove('active');
                    navMenu?.classList.remove('active');
                }
            }
        });
    }

    // --- THEME SWITCHER ---
    function initializeThemeSwitcher() {
        const themeBtn = document.getElementById('nav-theme-switcher');
        if (!themeBtn) return;

        // Restore saved theme
        if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-theme');

        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            if (typeof applyThemeAssets === 'function') applyThemeAssets();
            refreshCompactNavButtons();
            try { window.dispatchEvent(new CustomEvent('dedsec:themechange', { detail: { theme: isLight ? 'light' : 'dark' } })); } catch (_) {}
        });
    }

    // --- LANGUAGE MANAGEMENT ---
    window.changeLanguage = (lang) => {
        currentLanguage = lang;
        document.documentElement.lang = lang === 'gr' ? 'el' : 'en';
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

        const translatedAttributes = ['aria-label', 'alt', 'title', 'placeholder'];
        translatedAttributes.forEach((attribute) => {
            const selector = `[data-en-${attribute}], [data-gr-${attribute}]`;
            document.querySelectorAll(selector).forEach((el) => {
                const translated = el.getAttribute(`data-${lang}-${attribute}`)
                    || el.getAttribute(`data-en-${attribute}`);
                if (translated !== null) el.setAttribute(attribute, translated);
            });
        });

        document.querySelectorAll('[data-lang-section]').forEach(el => {
            const isMatch = el.dataset.langSection === lang;
            el.style.display = isMatch ? 'block' : 'none';
            el.classList.toggle('hidden-by-default', !isMatch);
        });

        // Update dynamic links that change by language (downloads, Stripe, etc.)
        document.querySelectorAll('[data-en-link], [data-gr-link], .payment-btn').forEach(link => {
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

        try { window.dispatchEvent(new CustomEvent('dedsec:languagechange', { detail: { language: lang } })); } catch (_) {}
        refreshCompactNavButtons();

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
            const original = button.getAttribute(`data-${currentLanguage}`) || button.textContent;
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
        const attachToggle = (header, handler) => {
            if (!header || header.dataset.toggleInit === '1') return;
            header.dataset.toggleInit = '1';
            header.addEventListener('click', handler);
        };

        // Some sections (like Sponsors-Only on Learn About The Tools) may live
        // outside the original container. Bind page-wide and dedupe listeners so
        // every category/tool dropdown works reliably.
        document.querySelectorAll('.category-header').forEach((header) => {
            attachToggle(header, () => {
                header.parentElement?.classList.toggle('active');
            });
        });

        document.querySelectorAll('.tool-header').forEach((header) => {
            attachToggle(header, (e) => {
                e.stopPropagation();
                header.parentElement?.classList.toggle('active');
            });
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


        const SECRET_PAGE_PATH = 'Pages/unused-template.html';
        const normalizeSearchTerm = (value) => String(value || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/['"`]+/g, '')
            .replace(/[^a-z0-9Ͱ-Ͽ]+/g, ' ')
            .trim();
        const SEARCH_SYNONYMS = {
            // Termux misspellings
            'termix': ['termux'], 'tremux': ['termux'], 'trmux': ['termux'], 'termax': ['termux'], 'termuxx': ['termux'], 'temux': ['termux'],
            // Python / pip misspellings
            'pyton': ['python'], 'pyhton': ['python'], 'pytohn': ['python'], 'pthon': ['python'], 'pithon': ['python'],
            'pip3': ['pip', 'python package'], 'pyp': ['pip'],
            // GitHub / git misspellings
            'githab': ['github'], 'gitub': ['github'], 'githubb': ['github'], 'gihub': ['github'], 'git hub': ['github'],
            'clon': ['clone'], 'clne': ['clone'], 'cloned': ['clone'],
            // Storage / permission misspellings
            'permision': ['permission'], 'permisson': ['permission'], 'premission': ['permission'], 'permisions': ['permission'],
            'denide': ['denied'], 'denyed': ['denied'], 'acess': ['access'], 'acces': ['access'],
            'storag': ['storage'], 'storge': ['storage'], 'downlod': ['download'], 'dowload': ['download'], 'downloades': ['downloads'],
            // Common error phrases
            'module not found': ['modulenotfounderror', 'missing module', 'install python library'],
            'modulenotfound': ['modulenotfounderror', 'missing module'],
            'no module named': ['modulenotfounderror', 'missing module'],
            'command not found': ['package command not found', 'install package'],
            'permission denied': ['chmod executable storage permission'],
            'no such file': ['path folder file not found'],
            'no space': ['storage cache disk cleanup'],
            'localhost': ['local server flask python http server'],
            'local host': ['localhost local server'],
            'port in use': ['port already in use kill process'],
            'address already in use': ['port already in use kill process'],
            'ssl': ['certificate curl requests api'],
            'certificate': ['ssl certificate curl requests api'],
            'apt': ['pkg repository dpkg package'],
            'dpkg': ['apt package lock repository'],
            'widget': ['termux widget shortcuts launcher'],
            'api': ['termux api notifications battery clipboard'],
            'crlf': ['line endings windows bad interpreter'],
            'bad interpreter': ['shebang env python line endings'],
            'github pages': ['site seo sitemap deploy workflow'],
            'seo': ['search console sitemap meta title description indexing'],
            'backup': ['zip restore downloads project backup'],
            'dedsec install': ['install dedsec project android termux'],
            'dedsec broken': ['fix dedsec broken install repair']
        };

        const expandSearchQuery = (normalizedQuery) => {
            const variants = new Set([normalizedQuery]);
            const addVariant = (value) => {
                const normalized = normalizeSearchTerm(value);
                if (normalized) variants.add(normalized);
            };
            Object.entries(SEARCH_SYNONYMS).forEach(([wrong, replacements]) => {
                const w = normalizeSearchTerm(wrong);
                if (!w || !normalizedQuery.includes(w)) return;
                replacements.forEach((replacement) => {
                    addVariant(normalizedQuery.replace(w, replacement));
                    addVariant(`${normalizedQuery} ${replacement}`);
                });
            });
            return Array.from(variants);
        };

        const shouldOpenSecretLevel = (value) => {
            const normalized = normalizeSearchTerm(value);
            return normalized === 'watch dogs'
                || normalized === 'dead space 2'
                || normalized === 'arcade master'
                || normalized.startsWith('arcade master ');
        };
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

        
        const SEARCH_VERSION = '2026-06-01-v31-site-quality-search';
        const SEARCH_STORAGE_KEY = `dedsec_search_index_${SEARCH_VERSION}`;
        const SEARCH_PAGES_STORAGE_KEY = `dedsec_search_pages_${SEARCH_VERSION}`;

        // Pages we always want searchable (static, always exist).
        const BASE_PAGES = [
            "index.html",
            "assistance.html",
            "Pages/guide-for-installation.html",
            "Pages/learn-about-the-tools.html",
            "Pages/store.html",
            "Pages/faq.html",
            "Pages/our-vision.html",
            "Pages/contact-credits.html",
            "Pages/butsystem-exclusive.html",
            "Pages/keep-android-open.html",
            "Pages/privacy-policy.html",
            "Assistance/fix-dedsec-broken-install.html",
            "Assistance/fix-github-ssh-authentication-termux.html",
            "Assistance/fix-localhost-server-not-opening-android.html",
            "Assistance/fix-node-npm-errors-termux.html",
            "Assistance/fix-pip-errors-termux.html",
            "Assistance/fix-python-module-not-found-termux.html",
            "Assistance/fix-python-syntax-errors-termux.html",
            "Assistance/fix-termux-dpkg-apt-lock.html",
            "Assistance/fix-termux-git-push-email-identity.html",
            "Assistance/fix-termux-no-space-left.html",
            "Assistance/fix-termux-no-such-file-or-directory.html",
            "Assistance/fix-termux-permission-denied-executable.html",
            "Assistance/fix-termux-port-already-in-use.html",
            "Assistance/fix-termux-repository-errors.html",
            "Assistance/fix-termux-ssl-certificate-curl-errors.html",
            "Assistance/fix-termux-storage-permission.html",
            "Assistance/fix-termux-widget-scripts.html",
            "Assistance/github-clone-termux.html",
            "Assistance/install-dedsec-project-android.html",
            "Assistance/keep-termux-running-background.html",
            "Assistance/termux-android-webview-browser-tips.html",
            "Assistance/termux-backup-restore-workflow.html",
            "Assistance/termux-beginner-guide-android.html",
            "Assistance/termux-build-dedsec-style-tool.html",
            "Assistance/termux-check-broken-links-locally.html",
            "Assistance/termux-clean-cache-safely.html",
            "Assistance/termux-cloudflared-local-link-help.html",
            "Assistance/termux-command-cheat-sheet.html",
            "Assistance/termux-command-history-and-aliases.html",
            "Assistance/termux-common-exit-codes.html",
            "Assistance/termux-cool-script-ideas.html",
            "Assistance/termux-create-python-menu-script.html",
            "Assistance/termux-debug-log-files.html",
            "Assistance/termux-download-with-curl-wget.html",
            "Assistance/termux-edit-files-with-nano.html",
            "Assistance/termux-fix-bash-bad-interpreter.html",
            "Assistance/termux-fix-crontab-alternatives.html",
            "Assistance/termux-fix-git-auth-token-github.html",
            "Assistance/termux-fix-git-large-file-push.html",
            "Assistance/termux-fix-line-endings-windows-crlf.html",
            "Assistance/termux-fix-pyinstaller-on-android-alternatives.html",
            "Assistance/termux-fix-python-encoding-unicode-errors.html",
            "Assistance/termux-fix-requests-ssl-and-api-errors.html",
            "Assistance/termux-fix-shebang-env-python.html",
            "Assistance/termux-fix-termux-api-not-working.html",
            "Assistance/termux-flask-app-not-loading.html",
            "Assistance/termux-git-branch-basics.html",
            "Assistance/termux-git-pull-conflicts.html",
            "Assistance/termux-github-pages-update-workflow.html",
            "Assistance/termux-html-css-js-editing-from-phone.html",
            "Assistance/termux-install-common-python-libraries.html",
            "Assistance/termux-install-source-and-first-setup.html",
            "Assistance/termux-json-file-errors.html",
            "Assistance/termux-learn-python-by-building-tools.html",
            "Assistance/termux-learning-roadmap.html",
            "Assistance/termux-local-website-python-server.html",
            "Assistance/termux-low-end-phone-performance-tips.html",
            "Assistance/termux-manage-large-projects-on-phone.html",
            "Assistance/termux-no-root-limitations.html",
            "Assistance/termux-offline-documentation-folder.html",
            "Assistance/termux-package-command-not-found.html",
            "Assistance/termux-phone-coding-workflow.html",
            "Assistance/termux-project-folder-structure.html",
            "Assistance/termux-python-error-debugging-roadmap.html",
            "Assistance/termux-python-virtual-environment.html",
            "Assistance/termux-run-python-script-correctly.html",
            "Assistance/termux-safe-automation-ideas.html",
            "Assistance/termux-safe-copy-paste.html",
            "Assistance/termux-safe-update-routine.html",
            "Assistance/termux-secure-api-keys-env-file.html",
            "Assistance/termux-site-seo-checklist-from-phone.html",
            "Assistance/termux-troubleshooting-checklist.html",
            "Assistance/termux-websocket-socketio-errors.html",
            "Assistance/termux-write-better-readme.html",
            "Assistance/unzip-files-termux-android.html",
            "Assistance/update-dedsec-project.html"
        ];
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
            if (parts.includes('Assistance')) return `Assistance/${file}`;
return file;
        };

        const extractSearchText = (root) => {
            if (!root) return '';
            return Array.from(root.querySelectorAll('h1,h2,h3,h4,p,li,summary,code,pre,.feature-title,.tool-title,.category-header,.assistance-card-title,.assistance-card-desc,.copy-code'))
                .map((el) => [el.getAttribute('data-en'), el.getAttribute('data-gr'), el.textContent].filter(Boolean).join(' '))
                .join(' ');
        };

        const buildPageItems = (doc, pagePath) => {
            ensureDeterministicIds(doc);

            const pageTitle = (doc.querySelector('title')?.textContent || '').trim();
            const metaDesc = (doc.querySelector('meta[name="description"]')?.getAttribute('content') || '').trim();
            const h1 = doc.querySelector('main h1, h1');
            const h1Text = (h1?.getAttribute('data-en') || h1?.textContent || '').trim();
            const label =
                pageTitle ||
                h1Text ||
                pagePath
                    .replace(/^Pages\//, '')
                    .replace(/^Assistance\//, '')
                    .replace(/\.html$/i, '')
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (m) => m.toUpperCase());

            const scope = doc.querySelector('main') || doc.body;
            const items = [];
            const pageText = extractSearchText(scope);
            const pathWords = pagePath.replace(/[\/_.-]+/g, ' ');
            const titleEn = (h1?.getAttribute('data-en') || h1Text || label).trim();
            const titleGr = (h1?.getAttribute('data-gr') || titleEn).trim();

            // One strong page-level item helps misspelled searches find the exact guide instead of only section anchors.
            items.push({
                title_en: titleEn,
                title_gr: titleGr,
                title: titleEn,
                meta: metaDesc || label,
                url: pagePath,
                keywords: normalizeSearchTerm([pageTitle, metaDesc, h1Text, pageText, pathWords].filter(Boolean).join(' ')),
                pagePath,
                isPageResult: true
            });

            const candidates = scope ? scope.querySelectorAll('h1, h2, h3, h4, .feature-title, .tool-title, .category-header, .assistance-card-title') : [];

            candidates.forEach((el) => {
                const en = (el.getAttribute('data-en') || '').trim();
                const gr = (el.getAttribute('data-gr') || '').trim();
                const fallback = (el.textContent || '').trim();

                const display = (currentLanguage === 'gr' ? (gr || en || fallback) : (en || gr || fallback)).trim();
                if (!display || display.length < 3) return;

                const container = el.closest('article, section, .content-section, .feature-card, .assistance-card, .tool-card, .guide-card, .problem-card') || el.parentElement || scope;
                const sectionText = extractSearchText(container);
                const keywords = normalizeSearchTerm([fallback, en, gr, sectionText, metaDesc, pathWords].filter(Boolean).join(' '));
                const hash = el.id ? `#${el.id}` : '';

                items.push({
                    title_en: (en || fallback).trim(),
                    title_gr: (gr || en || fallback).trim(),
                    title: (en || gr || fallback).trim(),
                    meta: metaDesc || label,
                    url: `${pagePath}${hash}`,
                    keywords,
                    pagePath,
                    isPageResult: false
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

        const editDistance = (a, b) => {
            a = String(a || ''); b = String(b || '');
            if (!a) return b.length;
            if (!b) return a.length;
            if (Math.abs(a.length - b.length) > 3) return Math.max(a.length, b.length);
            const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
            const curr = new Array(b.length + 1);
            for (let i = 1; i <= a.length; i++) {
                curr[0] = i;
                for (let j = 1; j <= b.length; j++) {
                    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                    curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
                }
                for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
            }
            return prev[b.length];
        };

        const tokenMatchScore = (queryToken, words) => {
            if (!queryToken) return 0;
            let best = 0;
            const first = queryToken[0];
            for (const w of words) {
                if (!w) continue;
                if (w === queryToken) return 16;
                if (w.startsWith(queryToken)) best = Math.max(best, 12);
                else if (queryToken.length >= 4 && w.includes(queryToken)) best = Math.max(best, 9);
                else if (queryToken.length >= 4 && w[0] === first) {
                    const d = editDistance(queryToken, w);
                    if (d === 1) best = Math.max(best, 8);
                    else if (d === 2 && queryToken.length >= 6) best = Math.max(best, 5);
                }
            }
            return best;
        };

        const scoreSearchItem = (it, normalizedQuery) => {
            if (!normalizedQuery) return 0;
            const titleText = normalizeSearchTerm(currentLanguage === 'gr' ? (it.title_gr || it.title || '') : (it.title_en || it.title || ''));
            const metaText = normalizeSearchTerm(it.meta || '');
            const urlText = normalizeSearchTerm((it.url || '').replace(/[\/_ .-]+/g, ' '));
            const rawKeywords = normalizeSearchTerm(it.keywords || '');
            const corpus = normalizeSearchTerm([titleText, metaText, rawKeywords, urlText].join(' '));
            const words = corpus.split(/\s+/).filter(Boolean);
            const titleWords = titleText.split(/\s+/).filter(Boolean);
            const queryVariants = expandSearchQuery(normalizedQuery);
            let bestScore = 0;

            queryVariants.forEach((q, variantIndex) => {
                const queryTokens = q.split(/\s+/).filter(Boolean);
                let score = variantIndex === 0 ? 0 : -4; // slight penalty for typo-expanded variants

                if (titleText === q) score += 140;
                if (titleText.includes(q)) score += 86;
                if (urlText.includes(q)) score += 48;
                if (metaText.includes(q)) score += 34;
                if (rawKeywords.includes(q)) score += 32;
                if (corpus.includes(q)) score += 24;
                if (it.isPageResult) score += 14;

                for (const token of queryTokens) {
                    score += tokenMatchScore(token, titleWords) * 4;
                    score += tokenMatchScore(token, words);
                }

                // Assistance guides should win over generic site sections when the query is a fix/problem/help query.
                const isAssistance = String(it.url || '').includes('Assistance/');
                const isHelpQuery = /(termux|python|pip|github|git|storage|permission|error|fix|install|clone|server|localhost|api|widget|command|module|package|backup|seo|sitemap)/.test(q);
                if (isAssistance && isHelpQuery) score += 24;
                if (!it.isPageResult) score -= 8; // page results first, then sections

                bestScore = Math.max(bestScore, score);
            });

            return bestScore;
        };


        const renderResults = async (query) => {
            const q = normalizeSearchTerm(query || '');
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
                .map(it => ({ ...it, _score: scoreSearchItem(it, q) }))
                .filter(it => it._score > 0)
                .sort((a, b) => b._score - a._score)
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


        // Open / close events
        openBtn.addEventListener('click', () => setOverlayVisible(true));
        closeBtn.addEventListener('click', () => setOverlayVisible(false));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) setOverlayVisible(false); });

        input.addEventListener('input', () => renderResults(input.value.trim()));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                setOverlayVisible(false);
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = input.value.trim();
                if (shouldOpenSecretLevel(query)) {
                    setOverlayVisible(false);
                    navigate(resolveUrl(SECRET_PAGE_PATH));
                    return;
                }
                const firstLink = resultsEl.querySelector('a.search-item[href]');
                if (firstLink) {
                    setOverlayVisible(false);
                    navigate(firstLink.getAttribute('href'));
                }
            }
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

    // --- ASSISTANT REMOVED ---
    // The old JSON chat assistant was replaced by assistance.html and standalone SEO pages.


    function initializeBorderSnake() {
        let snake = document.getElementById('border-snake');
        if (!snake) {
            snake = document.createElement('div');
            snake.id = 'border-snake';
            document.body.appendChild(snake);
        }
        snake.style.display = 'block';

        const inset = 8;
        const speed = 320; // px per second
        let rafId = null;
        let lastTs = null;
        let distance = 0;

        const animate = (ts) => {
            if (!document.body.contains(snake)) return;
            if (lastTs == null) lastTs = ts;
            const dt = Math.max(0, (ts - lastTs) / 1000);
            lastTs = ts;

            const w = Math.max(40, window.innerWidth - inset * 2);
            const h = Math.max(40, window.innerHeight - inset * 2);
            const perimeter = (w * 2) + (h * 2);
            distance = (distance + speed * dt) % perimeter;

            let x = inset;
            let y = inset;
            let rotate = 0;

            if (distance <= w) {
                x = inset + distance;
                y = inset;
                rotate = 0;
            } else if (distance <= w + h) {
                x = inset + w;
                y = inset + (distance - w);
                rotate = 90;
            } else if (distance <= (w * 2) + h) {
                x = inset + (w - (distance - (w + h)));
                y = inset + h;
                rotate = 180;
            } else {
                x = inset;
                y = inset + (h - (distance - ((w * 2) + h)));
                rotate = 270;
            }

            snake.style.left = `${x}px`;
            snake.style.top = `${y}px`;
            snake.style.transform = `translate(-50%, -50%) rotate(${rotate}deg)`;
            rafId = requestAnimationFrame(animate);
        };

        const reset = () => {
            lastTs = null;
        };

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            snake.remove();
            return;
        }

        window.addEventListener('resize', reset, { passive: true });
        window.addEventListener('orientationchange', reset, { passive: true });
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(animate);
    }


    function forceSquareNavControls() {
        document.querySelectorAll('.nav-action-btn, #nav-search, .burger-menu, .nav-menu .nav-link').forEach((el) => {
            el.style.borderRadius = '0px';
            el.style.webkitBorderRadius = '0px';
        });
    }


    function forceSquareButtonCorners() {
        const selectors = [
            'button', 'a.btn', '.btn', '.btn-primary', '.btn-ghost', '.nav-action-btn', '.nav-lang-btn', '.nav-theme-btn', '#nav-search',
            '.burger-menu', '.nav-link', '.hero-cta', '.feature-cta', '.contact-cta', '.contact-page-btn', '.copy-btn', '.footer-mini-btn',
            '.app-icon', '.assistant-chip', '.assistant-open-link', '.assistant-home', '.assistant-refresh', '.assistant-close',
            '.assistant-trigger', '.search-close', '.close-modal', '.payment-btn', '.sponsor-btn', '.faq-link-btn', '.language-selection-btn',
            '.theme-selection-btn', '.accept-btn', '.decline-btn', '.nm-btn'
        ].join(',');
        document.querySelectorAll(selectors).forEach((el) => {
            el.style.borderRadius = '0px';
            el.style.borderTopLeftRadius = '0px';
            el.style.borderTopRightRadius = '0px';
            el.style.borderBottomLeftRadius = '0px';
            el.style.borderBottomRightRadius = '0px';
            el.style.webkitBorderRadius = '0px';
        });
    }


    function forceSharpCornersEverywhere() {
        const selectors = [
            '.hero-section', '.content-section', '.trust-item', '.features-grid .feature-card', '.community-grid .community-card',
            '.category', '.category-header', '.tool-item', '.tool-header', '.tool-description', '.callout', '.glance-card', '.badge',
            '.contact-grid .app-icon', '.footer-mini-btn', '.footer-link-buttons a', '.sponsor-btn', '.main-footer', '.assistant-panel',
            '.assistant-bubble', '.assistant-chip', '.assistant-open-link', '.assistant-inline-code', '.assistant-rich-section',
            '.code-container', '.modal-content', '.screen', '.phone-container', '.search-modal', '.search-input', '.search-close',
            '.nav-menu', '.nav-action-btn', '#nav-search', '.burger-menu', '.nav-menu .nav-link', '.copy-btn', '.btn', '.btn-primary',
            '.btn-ghost', '.hero-cta', '.feature-cta', '.contact-cta', '.contact-page-btn', '.payment-btn', '.faq-link-btn',
            '.language-selection-btn', '.theme-selection-btn', '.accept-btn', '.decline-btn',
            '.next-btn', '.nm-btn'
        ].join(',');
        document.querySelectorAll(selectors).forEach((el) => {
            el.style.borderRadius = '0px';
            el.style.borderTopLeftRadius = '0px';
            el.style.borderTopRightRadius = '0px';
            el.style.borderBottomLeftRadius = '0px';
            el.style.borderBottomRightRadius = '0px';
            el.style.webkitBorderRadius = '0px';
        });
    }


    function initializeHolographicScroll() {
        let ticking = false;
        const apply = () => {
            const y = window.scrollY || window.pageYOffset || 0;
            document.documentElement.style.setProperty('--scroll-shift', `${y}px`);
            ticking = false;
        };
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(apply);
        };
        apply();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
    }


    // Small UX + SEO fixes
    function initializeBrandingAndLinks() {
        // Add logo in navbar title (without changing HTML files)
        document.querySelectorAll('.nav-title .site-title').forEach(siteTitle => {
            if (siteTitle.querySelector('img')) return;
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
            siteTitle.prepend(img);
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


    // --- FEATURED ARTICLES CAROUSEL (shared across every page) ---
    function initializeFeaturedArticle() {
        const articles = [
            {
                source: 'Time Business News',
                href: 'https://timebusinessnews.com/inside-the-dedsec-project-when-a-termux-toolkit-crosses-the-line-between-cybersecurity-education-and-exploitation',
                image: 'Assets/Images/featured/time-business-news-dedsec.jpg',
                alt: {
                    en: 'DedSec Project article preview from Time Business News',
                    gr: 'Προεπισκόπηση άρθρου για το DedSec Project από το Time Business News'
                },
                title: {
                    en: 'Inside The DedSec Project: When A Termux Toolkit Crosses The Line Between Cybersecurity Education And Exploitation',
                    gr: 'Μέσα Στο DedSec Project: Όταν Μια Εργαλειοθήκη Termux Περνά Τη Γραμμή Μεταξύ Εκπαίδευσης Κυβερνοασφάλειας Και Εκμετάλλευσης'
                },
                description: {
                    en: 'An independent examination of the project’s educational tools, mobile-first approach, and the ethical boundaries of dual-use security software.',
                    gr: 'Μια ανεξάρτητη εξέταση των εκπαιδευτικών εργαλείων, της προσέγγισης που ξεκινά από το κινητό και των ηθικών ορίων του λογισμικού ασφάλειας διπλής χρήσης.'
                }
            },
            {
                source: 'TechBullion',
                href: 'https://techbullion.com/how-termux-is-turning-android-phones-into-portable-cybersecurity-toolkits',
                image: 'Assets/Images/featured/techbullion-termux-cybersecurity.webp',
                alt: {
                    en: 'Android and Termux cybersecurity article preview from TechBullion',
                    gr: 'Προεπισκόπηση άρθρου κυβερνοασφάλειας για Android και Termux από το TechBullion'
                },
                title: {
                    en: 'How Termux Is Turning Android Phones Into Portable Cybersecurity Toolkits',
                    gr: 'Πώς Το Termux Μετατρέπει Τα Android Κινητά Σε Φορητές Εργαλειοθήκες Κυβερνοασφάλειας'
                },
                description: {
                    en: 'How Termux and no-root projects such as DedSec Project lower the hardware barrier to cybersecurity education on Android.',
                    gr: 'Πώς το Termux και έργα χωρίς root, όπως το DedSec Project, μειώνουν το εμπόδιο του ακριβού εξοπλισμού για την εκπαίδευση κυβερνοασφάλειας στο Android.'
                }
            },
            {
                source: 'GuruHiTech',
                href: 'https://guruhitech.com/butsystem-py-a-local-first-private-workspace-for-termux-and-android',
                image: 'Assets/Images/featured/guruhitech-butsystem.webp',
                alt: {
                    en: 'ButSystem.py article preview from GuruHiTech',
                    gr: 'Προεπισκόπηση άρθρου για το ButSystem.py από το GuruHiTech'
                },
                title: {
                    en: 'ButSystem.py: A Local-First Private Workspace For Termux And Android',
                    gr: 'ButSystem.py: Ένας Ιδιωτικός Χώρος Εργασίας Με Προτεραιότητα Στα Τοπικά Δεδομένα Για Termux Και Android'
                },
                description: {
                    en: 'A review of ButSystem.py as a local-first private workspace that keeps chats, files, and profiles on the user’s own Android device.',
                    gr: 'Μια παρουσίαση του ButSystem.py ως ιδιωτικού χώρου εργασίας με προτεραιότητα στα τοπικά δεδομένα, ώστε συνομιλίες, αρχεία και προφίλ να παραμένουν στη συσκευή Android του χρήστη.'
                }
            },
            {
                source: 'Hacks.gr',
                href: 'https://hacks.gr/%ce%b1%cf%80%cf%8c-%cf%84%ce%bf-%ce%ba%ce%b9%ce%bd%ce%b7%cf%84%cf%8c-%cf%83%cf%84%ce%bf-hacking-lab-%ce%bf-%cf%80%ce%bb%ce%ae%cf%81%ce%b7%cf%82-%ce%bf%ce%b4%ce%b7%ce%b3%cf%8c%cf%82-%ce%b3%ce%b9%ce%b1/',
                image: 'Assets/Images/featured/hacks-gr-dedsec-project.webp',
                alt: {
                    en: 'DedSec Project hacking lab guide article preview from Hacks.gr',
                    gr: 'Προεπισκόπηση του οδηγού για το DedSec Project και το hacking lab από το Hacks.gr'
                },
                title: {
                    en: 'DedSec Project: The Complete Guide To The Tool That Turns Your Phone Into A Hacking Lab',
                    gr: 'DedSec Project: Ο Απόλυτος Οδηγός Για Το Εργαλείο Που Μετατρέπει Το Κινητό Σου Σε Hacking Lab'
                },
                description: {
                    en: 'A detailed Greek-language guide to the DedSec Project, Termux, its main tools, Android installation, and responsible cybersecurity use.',
                    gr: 'Ένας αναλυτικός ελληνικός οδηγός για το DedSec Project, το Termux, τα βασικά εργαλεία, την εγκατάσταση στο Android και την υπεύθυνη χρήση στην κυβερνοασφάλεια.'
                }
            },
            {
                source: 'AtoAllLinks',
                href: 'https://www.atoallinks.com/2026/butsystem-py-inside-dedsec-projects-exclusive-self-hosted-social-platform',
                image: null,
                alt: {
                    en: 'Article preview for ButSystem.py on AtoAllLinks',
                    gr: 'Προεπισκόπηση άρθρου για το ButSystem.py στο AtoAllLinks'
                },
                title: {
                    en: 'ButSystem.py: Inside DedSec Project’s Exclusive Self-Hosted Social Platform',
                    gr: 'ButSystem.py: Η Αποκλειστική Αυτοφιλοξενούμενη Κοινωνική Πλατφόρμα Του DedSec Project'
                },
                description: {
                    en: 'A closer look at ButSystem.py, DedSec Project’s sponsor-exclusive, self-hosted social platform and private workspace.',
                    gr: 'Μια πιο κοντινή ματιά στο ButSystem.py, την αποκλειστική για χορηγούς αυτοφιλοξενούμενη κοινωνική πλατφόρμα και ιδιωτικό χώρο εργασίας του DedSec Project.'
                }
            }
        ];

        if (!articles.length) return;

        for (let index = articles.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [articles[index], articles[randomIndex]] = [articles[randomIndex], articles[index]];
        }

        let section = document.getElementById('featured-articles');
        if (!section) {
            section = document.createElement('section');
            section.id = 'featured-articles';
            section.className = 'content-section featured-articles-section';
        }

        const titleId = 'featured-article-section-title';
        section.setAttribute('aria-labelledby', titleId);
        section.innerHTML = '';

        const heading = document.createElement('h2');
        heading.id = titleId;
        heading.dataset.en = 'Featured Articles';
        heading.dataset.gr = 'Προτεινόμενα Άρθρα';
        heading.textContent = currentLanguage === 'gr' ? heading.dataset.gr : heading.dataset.en;

        const intro = document.createElement('p');
        intro.className = 'featured-articles-intro';

        const introCount = document.createElement('span');
        introCount.dataset.en = `DedSec Project is featured in ${articles.length} articles.`;
        introCount.dataset.gr = `Το DedSec Project παρουσιάζεται σε ${articles.length} άρθρα.`;
        introCount.textContent = currentLanguage === 'gr' ? introCount.dataset.gr : introCount.dataset.en;

        const introPrompt = document.createElement('span');
        introPrompt.dataset.en = 'Check them below.';
        introPrompt.dataset.gr = 'Δείτε τα παρακάτω.';
        introPrompt.textContent = currentLanguage === 'gr' ? introPrompt.dataset.gr : introPrompt.dataset.en;

        intro.append(introCount, document.createElement('br'), introPrompt);

        const carousel = document.createElement('div');
        carousel.className = 'featured-articles-carousel';

        const viewport = document.createElement('div');
        viewport.className = 'featured-article-viewport';
        viewport.id = 'featured-article-viewport';

        const createArrow = (direction) => {
            const isPrevious = direction === 'previous';
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `featured-article-nav featured-article-${isPrevious ? 'previous' : 'next'}`;
            button.setAttribute('aria-controls', viewport.id);
            button.dataset.enAriaLabel = isPrevious ? 'Show previous featured article' : 'Show next featured article';
            button.dataset.grAriaLabel = isPrevious ? 'Εμφάνιση προηγούμενου προτεινόμενου άρθρου' : 'Εμφάνιση επόμενου προτεινόμενου άρθρου';
            button.dataset.enTitle = isPrevious ? 'Previous article' : 'Next article';
            button.dataset.grTitle = isPrevious ? 'Προηγούμενο άρθρο' : 'Επόμενο άρθρο';
            button.setAttribute('aria-label', currentLanguage === 'gr' ? button.dataset.grAriaLabel : button.dataset.enAriaLabel);
            button.title = currentLanguage === 'gr' ? button.dataset.grTitle : button.dataset.enTitle;
            button.textContent = isPrevious ? '←' : '→';
            return button;
        };

        const previousButton = createArrow('previous');
        const nextButton = createArrow('next');

        const counter = document.createElement('p');
        counter.className = 'featured-article-counter';
        counter.setAttribute('aria-live', 'polite');
        counter.setAttribute('aria-atomic', 'true');

        carousel.append(previousButton, viewport, nextButton);
        section.append(heading, intro, carousel, counter);

        let currentIndex = 0;
        let rotationTimer = null;

        const renderArticle = () => {
            const selected = articles[currentIndex];
            if (!selected) return;

            const card = document.createElement('a');
            card.className = 'featured-article-card';
            card.href = selected.href;
            card.target = '_blank';
            card.rel = 'noopener noreferrer external';
            card.dataset.enAriaLabel = `Read “${selected.title.en}” on ${selected.source}`;
            card.dataset.grAriaLabel = `Διάβασε το «${selected.title.gr}» στο ${selected.source}`;
            card.setAttribute('aria-label', currentLanguage === 'gr' ? card.dataset.grAriaLabel : card.dataset.enAriaLabel);

            if (selected.image) {
                const image = document.createElement('img');
                image.className = 'featured-article-image';
                image.src = assetUrl(selected.image);
                image.width = 800;
                image.height = 450;
                image.loading = 'lazy';
                image.decoding = 'async';
                image.dataset.enAlt = selected.alt.en;
                image.dataset.grAlt = selected.alt.gr;
                image.alt = currentLanguage === 'gr' ? selected.alt.gr : selected.alt.en;
                card.appendChild(image);
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'featured-article-placeholder';
                placeholder.setAttribute('aria-hidden', 'true');
                const icon = document.createElement('i');
                icon.className = 'fas fa-newspaper';
                placeholder.appendChild(icon);
                card.appendChild(placeholder);
            }

            const body = document.createElement('div');
            body.className = 'featured-article-body';

            const source = document.createElement('span');
            source.className = 'featured-article-source';
            source.textContent = selected.source;

            const articleTitle = document.createElement('h3');
            articleTitle.dataset.en = selected.title.en;
            articleTitle.dataset.gr = selected.title.gr;
            articleTitle.textContent = currentLanguage === 'gr' ? selected.title.gr : selected.title.en;

            const description = document.createElement('p');
            description.dataset.en = selected.description.en;
            description.dataset.gr = selected.description.gr;
            description.textContent = currentLanguage === 'gr' ? selected.description.gr : selected.description.en;

            const cta = document.createElement('span');
            cta.className = 'featured-article-cta';
            cta.dataset.en = 'Read Article';
            cta.dataset.gr = 'Διάβασε Το Άρθρο';
            cta.textContent = currentLanguage === 'gr' ? cta.dataset.gr : cta.dataset.en;

            body.append(source, articleTitle, description, cta);
            card.appendChild(body);
            viewport.replaceChildren(card);
            viewport.classList.remove('is-entering');
            void viewport.offsetWidth;
            viewport.classList.add('is-entering');

            const countText = `${currentIndex + 1} / ${articles.length}`;
            counter.dataset.en = countText;
            counter.dataset.gr = countText;
            counter.textContent = countText;
        };

        const showArticle = (nextIndex) => {
            currentIndex = (nextIndex + articles.length) % articles.length;
            renderArticle();
        };

        const stopRotation = () => {
            if (rotationTimer !== null) {
                window.clearInterval(rotationTimer);
                rotationTimer = null;
            }
        };

        const startRotation = () => {
            stopRotation();
            if (document.hidden) return;
            rotationTimer = window.setInterval(() => showArticle(currentIndex + 1), 5000);
        };

        const moveManually = (offset) => {
            showArticle(currentIndex + offset);
            startRotation();
        };

        previousButton.addEventListener('click', () => moveManually(-1));
        nextButton.addEventListener('click', () => moveManually(1));
        carousel.addEventListener('mouseenter', stopRotation);
        carousel.addEventListener('mouseleave', startRotation);
        carousel.addEventListener('focusin', stopRotation);
        carousel.addEventListener('focusout', () => {
            window.setTimeout(() => {
                if (!carousel.contains(document.activeElement)) startRotation();
            }, 0);
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopRotation();
            else startRotation();
        });

        renderArticle();
        startRotation();

        const footer = document.querySelector('.main-footer');
        if (footer?.parentNode) {
            footer.parentNode.insertBefore(section, footer);
        } else {
            (document.querySelector('main') || document.body)?.appendChild(section);
        }
    }

    function initializePreferredSourceButton() {
        const footer = document.querySelector('.main-footer');
        if (!footer || document.getElementById('google-preferred-source-btn')) return;

        const row = document.createElement('div');
        row.className = 'footer-link-buttons footer-preferred-source-row';

        const link = document.createElement('a');
        link.id = 'google-preferred-source-btn';
        link.className = 'footer-mini-btn footer-preferred-source-btn';
        link.href = 'https://www.google.com/preferences/source?q=ded-sec.space';
        link.target = '_blank';
        link.rel = 'noopener noreferrer external';
        link.dataset.en = 'Set DedSec Project As A Preferred Google Source';
        link.dataset.gr = 'Όρισε Το DedSec Project Ως Προτιμώμενη Πηγή Στο Google';
        link.dataset.enAriaLabel = 'Set DedSec Project website as a preferred source in Google';
        link.dataset.grAriaLabel = 'Όρισε την ιστοσελίδα του DedSec Project ως προτιμώμενη πηγή στο Google';
        link.textContent = currentLanguage === 'gr' ? link.dataset.gr : link.dataset.en;
        link.setAttribute('aria-label', currentLanguage === 'gr' ? link.dataset.grAriaLabel : link.dataset.enAriaLabel);

        row.appendChild(link);

        const firstLinkRow = footer.querySelector('.footer-link-buttons');
        if (firstLinkRow) firstLinkRow.insertAdjacentElement('afterend', row);
        else footer.prepend(row);
    }

    // --- DEEP-LINK ANCHORS (Deterministic IDs) ---
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
        initializeFeaturedArticle();
        initializePreferredSourceButton();
        initializeDeepLinks();
        initializeThemeSwitcher();
        initializeBrandingAndLinks();
        const oldSnake = document.getElementById('border-snake'); if (oldSnake) oldSnake.remove();
        refreshCompactNavButtons();
        initializeSearch();
        forceSquareNavControls();
        forceSquareButtonCorners();
        forceSharpCornersEverywhere();
        setTimeout(() => { forceSquareButtonCorners(); forceSharpCornersEverywhere(); }, 80);
        initializeToolCategories('.categories-container');
        initializeToolCategories('#faq-container');
        // Old JSON assistant page removed. assistance.html now handles support navigation.
        
        // Language Switcher (Navbar)
        document.getElementById('nav-lang-switcher')?.addEventListener('click', () => {
            const path = window.location.pathname || '/';
            const targetPath = pageLanguage === 'gr'
                ? (path.replace(/^\/el(?=\/|$)/, '') || '/')
                : (`/el${path === '/' ? '/' : path}`);
            localStorage.setItem('language', pageLanguage === 'gr' ? 'en' : 'gr');
            window.location.assign(targetPath + window.location.search + window.location.hash);
        });

        // Modals
        document.querySelectorAll('.modal-overlay').forEach(m => {
            m.addEventListener('click', (e) => { if(e.target === m ) m.classList.remove('visible'); });
            m.querySelector('.close-modal')?.addEventListener('click', () => m.classList.remove('visible'));
        });

        // Final Setup
        window.changeLanguage(pageLanguage);

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

        // Reveal Animations (skip on mobile + for reduced-motion users)
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobileLite = window.matchMedia('(max-width: 820px)').matches || window.matchMedia('(hover: none)').matches;

        if (!prefersReducedMotion && !isMobileLite) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        e.target.classList.add('animate-in');
                        observer.unobserve(e.target);
                    }
                });
            });
            document.querySelectorAll('.feature-card, .tool-item, .category').forEach(el => observer.observe(el));
        }
    }

    init();
});
