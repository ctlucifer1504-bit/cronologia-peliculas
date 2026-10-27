/**
 * main.js — inicialización general, cronología, búsqueda, filtros,
 * progreso de visualización y ficha ampliada.
 *
 * Los datos viven en js/movies.js (window.CRONOLOGIA_MOVIES).
 */
(() => {
    'use strict';

    const DATA = Array.isArray(window.CRONOLOGIA_MOVIES) ? window.CRONOLOGIA_MOVIES : [];
    const IMAGE_BASE = 'assets/images/movies/';
    const STORAGE_KEY = 'cronologia.watched.v1';
    const DEFAULT_UNIVERSE = 'Tierra-616';

    const $ = (selector, context = document) => context.querySelector(selector);
    const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

    const list = $('#timeline');
    const template = $('#movie-template');
    const searchInput = $('#movie-search');
    const searchClear = $('#search-clear');
    const noResults = $('#no-results');
    const resultsSummary = $('#results-summary');
    const clearFilters = $('#clear-filters');
    const emptyReset = $('#empty-reset');
    const filterChips = $$('.chip[data-filter]');
    const sortButtons = $$('.sort-btn[data-sort]');
    const progressTrack = $('#progress-track');
    const progressFill = $('#progress-fill');
    const progressHint = $('#progress-hint');
    const progressReset = $('#reset-progress');
    const watchedCount = $('#watched-count');
    const totalCount = $('#total-count');
    const countAll = $('#count-all');
    const countUnwatched = $('#count-unwatched');
    const countWatched = $('#count-watched');
    const dialog = $('#movie-dialog');
    const dialogClose = $('#dialog-close');
    const dialogBack = $('#dialog-back');
    const dialogPoster = $('.dialog-poster');
    const dialogImg = $('#dialog-poster-img');
    const dialogRank = $('#dialog-rank');
    const dialogTitle = $('#dialog-title');
    const dialogDate = $('#dialog-date');
    const dialogDuration = $('#dialog-duration');
    const dialogUniverse = $('#dialog-universe');
    const dialogWatch = $('#dialog-watch');
    const dialogPrev = $('#dialog-prev');
    const dialogNext = $('#dialog-next');
    const dialogPosition = $('#dialog-position');

    if (!list || !template) return;

    const shortDate = new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const longDate = new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const normalize = (value) => String(value)
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim();

    const slugify = (value) => normalize(value)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const pad = (value) => String(value).padStart(2, '0');

    const parseDate = (value) => {
        const parts = String(value).split('-').map(Number);
        if (parts.length !== 3 || parts.some(Number.isNaN)) return new Date(NaN);
        return new Date(parts[0], parts[1] - 1, parts[2]);
    };

    const formatDate = (date, formatter = shortDate) => {
        if (!date || Number.isNaN(date.getTime())) return 'Fecha por confirmar';
        return formatter.format(date);
    };

    const formatDuration = (minutes) => {
        const total = Number(minutes);
        if (!Number.isFinite(total) || total <= 0) return 'Duración por confirmar';
        const hours = Math.floor(total / 60);
        const mins = total % 60;
        return hours
            ? `${hours} h ${pad(mins)} min`
            : `${total} min`;
    };

    const movies = DATA
        .filter((movie) => movie && movie.title && movie.date)
        .map((movie, index) => {
            const releaseDate = parseDate(movie.date);
            return {
                ...movie,
                key: slugify(movie.title),
                storyOrder: index + 1,
                releaseDate,
                releaseYear: Number.isNaN(releaseDate.getTime()) ? null : releaseDate.getFullYear(),
                universe: movie.universe || DEFAULT_UNIVERSE,
                minutes: Number(movie.minutes) || 0
            };
        });

    const byKey = new Map(movies.map((movie) => [movie.key, movie]));
    const cards = new Map();

    const state = {
        query: '',
        filter: 'all',
        sort: 'story',
        watched: new Set(),
        ordered: [...movies],
        dialogKey: null
    };

    /* Persistencia del progreso ----------------------------------------- */
    const loadWatched = () => {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
        } catch {
            return [];
        }
    };

    const saveWatched = () => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.watched]));
        } catch {
            // El navegador puede bloquear localStorage (modo privado, políticas, etc.).
        }
    };

    const validKeys = new Set(movies.map((movie) => movie.key));
    state.watched = new Set(loadWatched().filter((key) => validKeys.has(key)));

    /* Avisos visuales ---------------------------------------------------- */
    const toastRegion = $('#toast-region');

    const showToast = (message, type = 'info') => {
        if (!toastRegion) return;
        const icon = type === 'success'
            ? 'check-circle'
            : type === 'error'
                ? 'info'
                : 'info';

        const toast = document.createElement('div');
        toast.className = `toast is-${type}`;
        toast.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#icon-${icon}"></use></svg><span class="toast-message"></span>`;
        $('.toast-message', toast).textContent = message;
        toastRegion.append(toast);

        const remove = () => {
            toast.classList.add('is-leaving');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
            window.setTimeout(() => toast.remove(), 500);
        };

        toast.addEventListener('click', remove);
        window.setTimeout(remove, 4200);
    };

    window.showToast = showToast;

    /* Pósteres ----------------------------------------------------------- */
    const setPoster = (img, container, movie) => {
        if (!img || !container) return;
        container.classList.remove('is-missing');

        const fallbackTitle = $('.fallback-title', container);
        if (fallbackTitle) fallbackTitle.textContent = movie.title;

        img.onload = () => container.classList.remove('is-missing');
        img.onerror = () => container.classList.add('is-missing');
        img.alt = `Póster de ${movie.title}`;
        img.src = `${IMAGE_BASE}${movie.image}`;
    };

    /* Tarjetas ----------------------------------------------------------- */
    const buildCard = (movie) => {
        const node = template.content.firstElementChild.cloneNode(true);
        const posterButton = $('.movie-poster', node);
        const img = $('img', posterButton);
        const watchButton = $('.watch-btn', node);
        const detailsButton = $('.details-btn', node);

        node.dataset.key = movie.key;
        node.dataset.order = String(movie.storyOrder);

        $('.movie-rank', node).textContent = `#${pad(movie.storyOrder)}`;

        const time = $('.movie-date', node);
        time.textContent = formatDate(movie.releaseDate);
        time.dateTime = movie.date;

        $('.movie-title', node).textContent = movie.title;
        $('.movie-duration', node).textContent = formatDuration(movie.minutes);
        $('.movie-universe', node).textContent = movie.universe;

        posterButton.setAttribute('aria-label', `Ver detalles de ${movie.title}`);
        detailsButton.setAttribute('aria-label', `Ver detalles de ${movie.title}`);
        watchButton.setAttribute('aria-label', `Marcar ${movie.title} como vista`);

        setPoster(img, posterButton, movie);

        posterButton.addEventListener('click', () => showMovie(movie.key));
        detailsButton.addEventListener('click', () => showMovie(movie.key));
        watchButton.addEventListener('click', () => toggleWatched(movie.key));

        cards.set(movie.key, { node, movie });
        return node;
    };

    const renderCards = () => {
        const fragment = document.createDocumentFragment();
        state.ordered.forEach((movie) => fragment.append(buildCard(movie)));
        list.append(fragment);
        list.hidden = movies.length === 0;
    };

    /* Filtros, orden y resultados --------------------------------------- */
    const getOrdered = () => [...movies].sort((a, b) => {
        if (state.sort === 'release') {
            const aTime = a.releaseDate.getTime() || 0;
            const bTime = b.releaseDate.getTime() || 0;
            return aTime - bTime || a.storyOrder - b.storyOrder;
        }
        return a.storyOrder - b.storyOrder;
    });

    const matchesQuery = (movie, term) => {
        if (!term) return true;
        const order = String(movie.storyOrder);
        return normalize(movie.title).includes(term)
            || order === term
            || pad(order).includes(term);
    };

    const matchesFilter = (movie) => {
        if (state.filter === 'watched') return state.watched.has(movie.key);
        if (state.filter === 'unwatched') return !state.watched.has(movie.key);
        return true;
    };

    const layoutTimeline = () => {
        $$('.timeline-item', list).forEach((item) => {
            item.classList.remove('is-left', 'is-right');
        });

        const visibleItems = [...list.children].filter((item) => !item.hidden);
        visibleItems.forEach((item, index) => {
            item.classList.add(index % 2 === 0 ? 'is-left' : 'is-right');
        });
    };

    const updateStats = () => {
        const total = movies.length;
        const watched = state.watched.size;
        const remaining = Math.max(total - watched, 0);
        const percent = total ? (watched / total) * 100 : 0;

        if (watchedCount) watchedCount.textContent = String(watched);
        if (totalCount) totalCount.textContent = String(total);
        if (countAll) countAll.textContent = String(total);
        if (countUnwatched) countUnwatched.textContent = String(remaining);
        if (countWatched) countWatched.textContent = String(watched);

        if (progressFill) progressFill.style.width = `${percent}%`;

        if (progressTrack) {
            progressTrack.setAttribute('aria-valuemax', String(total));
            progressTrack.setAttribute('aria-valuenow', String(watched));
        }

        if (progressReset) progressReset.hidden = watched === 0;

        if (progressHint) {
            if (total === 0) {
                progressHint.textContent = 'Todavía no hay películas en la cronología.';
            } else if (watched === 0) {
                progressHint.textContent = 'Marca las películas que ya viste.';
            } else if (watched === total) {
                progressHint.textContent = '¡Completaste la cronología!';
            } else {
                progressHint.textContent = `${remaining} ${remaining === 1 ? 'película' : 'películas'} por ver.`;
            }
        }
    };

    const updateResults = (visibleCount) => {
        const visibleNoun = visibleCount === 1 ? 'título' : 'títulos';
        const totalNoun = movies.length === 1 ? 'título' : 'títulos';
        const orderLabel = state.sort === 'release'
            ? 'orden de estreno'
            : 'orden cronológico de la historia';
        const isDefaultView = !state.query && state.filter === 'all';

        if (resultsSummary) {
            resultsSummary.textContent = isDefaultView
                ? `${visibleCount} ${visibleNoun} en ${orderLabel}`
                : `${visibleCount} de ${movies.length} ${totalNoun} · ${orderLabel}`;
        }

        if (clearFilters) {
            clearFilters.hidden = !(state.query || state.filter !== 'all' || state.sort !== 'story');
        }

        if (searchClear) searchClear.hidden = !state.query;
        if (noResults) noResults.hidden = visibleCount !== 0;
        list.hidden = visibleCount === 0;
    };

    const applyFilters = () => {
        const term = normalize(state.query.replace(/^#/, ''));
        let visibleCount = 0;

        movies.forEach((movie) => {
            const entry = cards.get(movie.key);
            if (!entry) return;

            const visible = matchesQuery(movie, term) && matchesFilter(movie);
            entry.node.hidden = !visible;
            if (visible) visibleCount += 1;
        });

        updateStats();
        updateResults(visibleCount);
        layoutTimeline();
    };

    /* Estado de "vista" -------------------------------------------------- */
    const updateCardState = (key) => {
        const entry = cards.get(key);
        if (!entry) return;

        const watched = state.watched.has(key);
        const button = $('.watch-btn', entry.node);
        const label = $('span', button);

        entry.node.classList.toggle('is-watched', watched);
        button.setAttribute('aria-pressed', String(watched));
        button.setAttribute('aria-label', watched
            ? `Quitar marca de vista de ${entry.movie.title}`
            : `Marcar ${entry.movie.title} como vista`);
        if (label) label.textContent = watched ? 'Vista' : 'Marcar como vista';
    };

    const toggleWatched = (key) => {
        const movie = byKey.get(key);
        if (!movie) return;

        const wasWatched = state.watched.has(key);
        if (wasWatched) {
            state.watched.delete(key);
        } else {
            state.watched.add(key);
        }

        saveWatched();
        updateCardState(key);
        updateDialogWatch();
        applyFilters();

        showToast(
            wasWatched
                ? `Quitamos “${movie.title}” de tus vistas.`
                : `¡Marcaste “${movie.title}” como vista!`,
            wasWatched ? 'info' : 'success'
        );
    };

    /* Ficha ampliada ----------------------------------------------------- */
    const updateDialogWatch = () => {
        if (!dialogWatch || !state.dialogKey) return;
        const watched = state.watched.has(state.dialogKey);
        const label = $('span', dialogWatch);

        dialogWatch.setAttribute('aria-pressed', String(watched));
        dialogWatch.setAttribute('aria-label', watched
            ? 'Quitar marca de vista'
            : 'Marcar como vista');
        if (label) label.textContent = watched ? 'Vista' : 'Marcar como vista';
    };

    const updateDialogNav = () => {
        if (!state.dialogKey) return;
        const index = state.ordered.findIndex((movie) => movie.key === state.dialogKey);
        if (dialogPosition) {
            dialogPosition.textContent = index >= 0
                ? `${index + 1} de ${state.ordered.length}`
                : '';
        }
        if (dialogPrev) dialogPrev.disabled = index <= 0;
        if (dialogNext) dialogNext.disabled = index < 0 || index >= state.ordered.length - 1;
    };

    const populateDialog = (movie) => {
        if (!dialog) return;

        dialogRank.textContent = `#${pad(movie.storyOrder)} · Orden en la historia`;
        dialogTitle.textContent = movie.title;
        dialogDate.textContent = formatDate(movie.releaseDate, longDate);
        dialogDuration.textContent = formatDuration(movie.minutes);
        dialogUniverse.textContent = movie.universe;

        setPoster(dialogImg, dialogPoster, movie);
        updateDialogWatch();
        updateDialogNav();
    };

    const showMovie = (key) => {
        const movie = byKey.get(key);
        if (!movie || !dialog) return;

        state.dialogKey = key;
        populateDialog(movie);

        if (!dialog.open) {
            dialog.showModal();
            document.body.classList.add('no-scroll');
        }
    };

    const navigateDialog = (direction) => {
        const index = state.ordered.findIndex((movie) => movie.key === state.dialogKey);
        const target = state.ordered[index + direction];
        if (target) showMovie(target.key);
    };

    if (dialog) {
        dialogClose?.addEventListener('click', () => dialog.close());
        dialogBack?.addEventListener('click', () => dialog.close());
        dialogWatch?.addEventListener('click', () => {
            if (state.dialogKey) toggleWatched(state.dialogKey);
        });
        dialogPrev?.addEventListener('click', () => navigateDialog(-1));
        dialogNext?.addEventListener('click', () => navigateDialog(1));

        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) dialog.close();
        });

        dialog.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                navigateDialog(-1);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                navigateDialog(1);
            }
        });

        dialog.addEventListener('close', () => {
            state.dialogKey = null;
            document.body.classList.remove('no-scroll');
        });
    }

    /* Eventos de búsqueda, filtros y orden ------------------------------- */
    let searchFrame = 0;

    searchInput?.addEventListener('input', () => {
        window.cancelAnimationFrame(searchFrame);
        searchFrame = window.requestAnimationFrame(() => {
            state.query = searchInput.value;
            applyFilters();
        });
    });

    searchClear?.addEventListener('click', () => {
        state.query = '';
        searchInput.value = '';
        searchInput.focus();
        applyFilters();
    });

    filterChips.forEach((button) => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            if (!filter || filter === state.filter) return;

            state.filter = filter;
            filterChips.forEach((chip) => {
                const active = chip === button;
                chip.classList.toggle('is-active', active);
                chip.setAttribute('aria-pressed', String(active));
            });
            applyFilters();
        });
    });

    sortButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const sort = button.dataset.sort;
            if (!sort || sort === state.sort) return;

            state.sort = sort;
            sortButtons.forEach((sortButton) => {
                const active = sortButton === button;
                sortButton.classList.toggle('is-active', active);
                sortButton.setAttribute('aria-pressed', String(active));
            });

            state.ordered = getOrdered();
            state.ordered.forEach((movie) => list.append(cards.get(movie.key).node));
            applyFilters();
        });
    });

    const resetView = () => {
        state.query = '';
        state.filter = 'all';
        state.sort = 'story';
        if (searchInput) searchInput.value = '';

        filterChips.forEach((chip) => {
            const active = chip.dataset.filter === 'all';
            chip.classList.toggle('is-active', active);
            chip.setAttribute('aria-pressed', String(active));
        });

        sortButtons.forEach((button) => {
            const active = button.dataset.sort === 'story';
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });

        state.ordered = getOrdered();
        state.ordered.forEach((movie) => list.append(cards.get(movie.key).node));
        applyFilters();
    };

    clearFilters?.addEventListener('click', resetView);
    emptyReset?.addEventListener('click', () => {
        resetView();
        searchInput?.focus();
    });

    progressReset?.addEventListener('click', () => {
        if (state.watched.size === 0) return;
        const confirmed = window.confirm('¿Quieres reiniciar el progreso de películas vistas?');
        if (!confirmed) return;

        state.watched.clear();
        saveWatched();
        movies.forEach((movie) => updateCardState(movie.key));
        applyFilters();
        showToast('Progreso reiniciado. Puedes volver a marcar tus películas.', 'info');
    });

    /* Redes sociales (aún sin perfiles oficiales) ----------------------- */
    $$('[data-social]').forEach((button) => {
        button.addEventListener('click', () => {
            showToast(`Nuestro perfil de ${button.dataset.social} estará disponible muy pronto.`, 'info');
        });
    });

    /* Datos visibles en la portada -------------------------------------- */
    const years = movies
        .map((movie) => movie.releaseYear)
        .filter((year) => Number.isFinite(year));

    const minYear = years.length ? Math.min(...years) : null;
    const maxYear = years.length ? Math.max(...years) : null;

    if ($('#hero-movie-count')) $('#hero-movie-count').textContent = String(movies.length);
    if ($('#hero-count-badge')) $('#hero-count-badge').textContent = String(movies.length);
    if ($('#hero-year-start') && minYear) $('#hero-year-start').textContent = String(minYear);
    if ($('#hero-year-end') && maxYear) $('#hero-year-end').textContent = String(maxYear);
    if ($('#current-year')) $('#current-year').textContent = String(new Date().getFullYear());

    /* Aparición progresiva ---------------------------------------------- */
    const revealItems = $$('.reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add('is-visible'));
    }

    /* Arranque ----------------------------------------------------------- */
    renderCards();
    movies.forEach((movie) => updateCardState(movie.key));
    applyFilters();
})();
