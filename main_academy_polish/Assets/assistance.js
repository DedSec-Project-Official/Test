(() => {
  'use strict';

  const isGreek = () => document.documentElement.lang.toLowerCase().startsWith('el');
  const normalize = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9α-ω:+._/-]+/gi, ' ')
    .trim();

  const copyText = async (text) => {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.inset = '-1000px auto auto -1000px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus({ preventScroll: true });
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('Copy failed');
  };

  const feedback = (button, success, successEn, successEl) => {
    const original = button.textContent;
    button.textContent = success
      ? (isGreek() ? successEl : successEn)
      : (isGreek() ? 'Η αντιγραφή απέτυχε' : 'Copy failed');
    button.classList.toggle('copy-success', success);
    button.classList.toggle('copy-fail', !success);
    window.setTimeout(() => {
      button.textContent = original;
      button.classList.remove('copy-success', 'copy-fail');
    }, 1800);
  };

  const initCodeCopy = () => {
    document.querySelectorAll('.assistance-code-copy').forEach((button) => {
      button.addEventListener('click', async () => {
        const code = button.closest('.assistance-code')?.querySelector('code');
        const text = code?.textContent?.trim();
        if (!text) return;
        try {
          await copyText(text);
          feedback(button, true, 'Commands copied', 'Οι εντολές αντιγράφηκαν');
        } catch (_) {
          feedback(button, false, '', '');
        }
      });
    });
  };

  const initSupportReports = () => {
    document.querySelectorAll('.assistance-report-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const title = isGreek() ? button.dataset.guideTitleGr : button.dataset.guideTitleEn;
        const report = isGreek()
          ? `Οδηγός: ${title}\nΣυσκευή / έκδοση Android:\nΠηγή και έκδοση Termux:\nΑκριβής εντολή:\nΤρέχων φάκελος (pwd):\nΈκδοση runtime / πακέτου:\nΠλήρες error ή output:\nΤι δοκίμασα ήδη:\nΤι άλλαξε πριν εμφανιστεί:\n\nΑφαίρεσα passwords, tokens, private keys, ακριβείς προσωπικές διαδρομές και προσωπικά στοιχεία: ΝΑΙ / ΟΧΙ`
          : `Guide: ${title}\nDevice / Android version:\nTermux source and version:\nExact command:\nCurrent folder (pwd):\nRuntime / package version:\nComplete error or output:\nWhat I already tried:\nWhat changed before it appeared:\n\nPasswords, tokens, private keys, exact personal paths, and personal information removed: YES / NO`;
        try {
          await copyText(report);
          feedback(button, true, 'Support report copied', 'Η αναφορά αντιγράφηκε');
        } catch (_) {
          feedback(button, false, '', '');
        }
      });
    });
  };

  const initFinder = () => {
    const finder = document.querySelector('.assistance-finder');
    const main = document.querySelector('main.assistance-page');
    if (!finder || !main) return;

    const filterButtons = [...finder.querySelectorAll('.assistance-filter-btn')];
    const cards = [...main.querySelectorAll('.assistance-card')];
    const sections = [...main.querySelectorAll('.assistance-category-section')];
    const status = document.getElementById('assistance-results-status');
    const noResults = document.getElementById('assistance-no-results');
    let activeFilter = 'all';

    const updateExpandButton = (section, eligibleCards, expanded, filtering) => {
      const button = section.querySelector('.assistance-expand-btn');
      if (!button) return;
      const total = eligibleCards.length;
      button.hidden = filtering || total <= Number(section.dataset.visibleLimit || 6);
      button.setAttribute('aria-expanded', String(expanded));
      if (button.hidden) return;
      button.textContent = expanded
        ? (isGreek() ? 'Εμφάνιση λιγότερων' : 'Show fewer')
        : (isGreek() ? `Εμφάνιση και των ${total} οδηγών` : `Show all ${total} guides`);
    };

    const apply = () => {
      const filtering = activeFilter !== 'all';

      cards.forEach((card) => {
        const categoryMatch = activeFilter === 'all' || card.dataset.category === activeFilter;
        card.classList.toggle('is-filtered-out', !categoryMatch);
        card.classList.remove('is-collapsed-card');
        card.style.order = '';
      });

      sections.forEach((section) => {
        const expanded = section.dataset.expanded === 'true';
        const matching = [...section.querySelectorAll('.assistance-card:not(.is-filtered-out)')];
        const limit = Number(section.dataset.visibleLimit || 6);
        if (!filtering && !expanded) {
          matching.slice(limit).forEach((card) => card.classList.add('is-collapsed-card'));
        }
        const sectionVisible = matching.some((card) => !card.classList.contains('is-collapsed-card'));
        section.classList.toggle('is-filtered-out', !sectionVisible);
        updateExpandButton(section, matching, expanded, filtering);
      });

      const totalMatches = cards.filter((card) => !card.classList.contains('is-filtered-out')).length;
      if (status) {
        status.textContent = isGreek()
          ? `${totalMatches} ${totalMatches === 1 ? 'οδηγός' : 'οδηγοί'} ${filtering ? 'εμφανίζονται' : 'διαθέσιμοι'}.`
          : `${totalMatches} ${totalMatches === 1 ? 'guide' : 'guides'} ${filtering ? 'shown' : 'available'}.`;
      }
      if (noResults) noResults.hidden = totalMatches !== 0;
    };

    sections.forEach((section) => {
      section.dataset.expanded = 'false';
      section.querySelector('.assistance-expand-btn')?.addEventListener('click', () => {
        const expanded = section.dataset.expanded === 'true';
        section.dataset.expanded = String(!expanded);
        apply();
      });
    });

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeFilter = button.dataset.filter || 'all';
        filterButtons.forEach((candidate) => {
          const selected = candidate === button;
          candidate.classList.toggle('is-active', selected);
          candidate.setAttribute('aria-pressed', String(selected));
        });
        apply();
      });
    });

    apply();
  };

  const initNavigationAccessibility = () => {
    const burger = document.getElementById('burger-menu');
    const menu = document.getElementById('nav-menu');
    if (!burger || !menu) return;
    const sync = () => burger.setAttribute('aria-expanded', String(menu.classList.contains('active')));
    burger.setAttribute('aria-controls', 'nav-menu');
    sync();
    burger.addEventListener('click', () => window.setTimeout(sync, 0));
    const observer = new MutationObserver(sync);
    observer.observe(menu, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !menu.classList.contains('active')) return;
      menu.classList.remove('active');
      burger.classList.remove('active');
      sync();
      burger.focus();
    });
  };

  const init = () => {
    initCodeCopy();
    initSupportReports();
    initFinder();
    initNavigationAccessibility();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
