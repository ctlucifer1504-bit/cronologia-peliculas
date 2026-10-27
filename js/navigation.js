/**
 * navigation.js — menú móvil, navegación suave, enlace activo,
 * encabezado con scroll y botón de volver arriba.
 */
(() => {
    'use strict';

    const $ = (selector, context = document) => context.querySelector(selector);
    const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

    const header = $('.site-header');
    const nav = $('#main-nav');
    const toggle = $('#nav-toggle');
    const backToTop = $('#back-to-top');
    const navLinks = $$('.nav-link');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const sectionData = navLinks
        .map((link) => {
            const href = link.getAttribute('href');
            const section = href && href.startsWith('#') ? $(href) : null;
            return section ? { link, section } : null;
        })
        .filter(Boolean);

    const headerOffset = () => (header ? header.offsetHeight : 0) + 16;

    /* Menú móvil --------------------------------------------------------- */
    const isMenuOpen = () => Boolean(nav?.classList.contains('is-open'));

    const setMenu = (open) => {
        if (!nav || !toggle) return;

        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
        document.body.classList.toggle('no-scroll', open && window.innerWidth < 900);
    };

    toggle?.addEventListener('click', () => setMenu(!isMenuOpen()));

    nav?.addEventListener('click', (event) => {
        if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('click', (event) => {
        if (!isMenuOpen()) return;
        if (nav?.contains(event.target) || toggle?.contains(event.target)) return;
        setMenu(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isMenuOpen()) {
            setMenu(false);
            toggle?.focus();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 900 && isMenuOpen()) setMenu(false);
    });

    /* Navegación suave --------------------------------------------------- */
    const scrollToTarget = (target, updateHistory = true) => {
        if (!target) return;

        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset();

        window.scrollTo({
            top: Math.max(top, 0),
            behavior: reduceMotion.matches ? 'auto' : 'smooth'
        });

        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });

        if (updateHistory && target.id) {
            try {
                window.history.pushState(null, '', `#${target.id}`);
            } catch {
                // En algunos contextos (file://) el navegador puede bloquear pushState.
            }
        }
    };

    $$('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;

            const target = $(href);
            if (!target) return;

            event.preventDefault();
            setMenu(false);
            scrollToTarget(target);
        });
    });

    /* Enlace activo según la sección visible ----------------------------- */
    const setActiveLink = (id) => {
        navLinks.forEach((link) => {
            const active = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('is-active', active);
            if (active) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const updateActiveLink = (scrollY) => {
        if (!sectionData.length) return;

        const offset = headerOffset() + 24;
        let current = sectionData[0].section.id;

        sectionData.forEach(({ section }) => {
            const position = section.getBoundingClientRect().top + scrollY;
            if (position <= scrollY + offset) current = section.id;
        });

        setActiveLink(current);
    };

    /* Scroll: encabezado, enlace activo y botón superior ----------------- */
    let ticking = false;

    const onScroll = () => {
        const scrollY = window.scrollY;

        header?.classList.toggle('is-scrolled', scrollY > 8);

        if (backToTop) backToTop.hidden = scrollY < 560;

        updateActiveLink(scrollY);
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(onScroll);
    }, { passive: true });

    const goToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: reduceMotion.matches ? 'auto' : 'smooth'
        });

        const start = $('#inicio');
        if (start) {
            if (!start.hasAttribute('tabindex')) start.setAttribute('tabindex', '-1');
            start.focus({ preventScroll: true });
        }
    };

    backToTop?.addEventListener('click', goToTop);

    $$('[data-scroll-top]').forEach((button) => {
        button.addEventListener('click', goToTop);
    });

    /* Enlaces directos al cargar ---------------------------------------- */
    if (window.location.hash) {
        try {
            const target = $(window.location.hash);
            if (target) {
                window.setTimeout(() => scrollToTarget(target, false), 80);
            }
        } catch {
            // Ignora hashes que no sean selectores válidos.
        }
    }

    onScroll();
})();
