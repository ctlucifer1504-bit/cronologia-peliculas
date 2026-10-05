(() => {
    'use strict';

    const DEFAULT_UNIVERSE = 'Tierra-616';

    const list = document.getElementById('timeline');
    const template = document.getElementById('movie-template');
    const searchInput = document.getElementById('search-input');
    const noResults = document.getElementById('no-results');
    const dialog = document.getElementById('image-dialog');
    const dialogImg = document.getElementById('dialog-img');

    const formatDuration = (min) => {
        const h = Math.floor(min / 60);
        const m = String(min % 60).padStart(2, '0');
        return h ? `${h}h ${m}m` : `${min}m`;
    };

    // "Capitán" -> "capitan": la búsqueda ignora tildes y mayúsculas
    const normalize = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.15 });

    function createCard(movie, index) {
        const node = template.content.firstElementChild.cloneNode(true);
        const number = String(index + 1).padStart(2, '0');

        const img = node.querySelector('img');
        img.src = `imagenes/${movie.image}`;
        img.alt = movie.title;

        node.querySelector('.number').textContent = `#${number}`;
        node.querySelector('h2').textContent = movie.title;
        const time = node.querySelector('time');
        time.textContent = movie.date;
        time.dateTime = movie.date;
        node.querySelector('.duration').textContent = formatDuration(movie.minutes);
        node.querySelector('.universe').textContent = movie.universe ?? DEFAULT_UNIVERSE;

        node.classList.add('reveal');
        observer.observe(node);

        return { node, text: normalize(`${movie.title} ${number}`) };
    }

    const cards = MOVIES.map(createCard);
    list.append(...cards.map((c) => c.node));
    document.getElementById('movie-count').textContent = MOVIES.length;

    searchInput.addEventListener('input', () => {
        const term = normalize(searchInput.value.trim().replace(/^#/, ''));
        let visible = 0;
        cards.forEach(({ node, text }) => {
            const match = text.includes(term);
            node.hidden = !match;
            if (match) visible++;
        });
        noResults.hidden = visible > 0;
    });

    // Ampliar póster: un solo listener para todas las tarjetas
    list.addEventListener('click', (e) => {
        const img = e.target.closest('.poster-btn')?.querySelector('img');
        if (!img) return;
        dialogImg.src = img.src;
        dialogImg.alt = img.alt;
        dialog.showModal();
    });

    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
    });
})();
