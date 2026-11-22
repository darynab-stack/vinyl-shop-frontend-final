showHeader();

const filtersForm = document.getElementById('filters-form');
const searchInput = document.getElementById('search-input');
const genreSelect = document.getElementById('genre-select');
const artistSelect = document.getElementById('artist-select');
const minPriceInput = document.getElementById('min-price-input');
const maxPriceInput = document.getElementById('max-price-input');
const inStockInput = document.getElementById('in-stock-input');
const resetFiltersButton = document.getElementById('reset-filters');

const catalogStatus = document.getElementById('catalog-status');
const albumsGrid = document.getElementById('albums-grid');

const albumCard = document.getElementById('album-card');
const closeCardButton = document.getElementById('close-card');
const cardInfo = document.getElementById('card-info');
const cardCart = document.getElementById('card-cart');
const cardNotify = document.getElementById('card-notify');
const cardTracks = document.getElementById('card-tracks');
const cardReviews = document.getElementById('card-reviews');

const DEFAULT_COVER =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">' +
            '<rect width="300" height="300" fill="#e7e2d9"/>' +
            '<circle cx="150" cy="150" r="95" fill="#2b2523"/>' +
            '<circle cx="150" cy="150" r="32" fill="#8c533e"/>' +
            '<circle cx="150" cy="150" r="8" fill="#f8f6f2"/>' +
            '</svg>'
    );

async function loadFilterOptions(endpoint, selectElement) {
    try {
        const response = await fetch(API_URL + endpoint);
        if (!response.ok) {
            return;
        }
        const items = await response.json();
        items.forEach((item) => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('Помилка завантаження фільтрів:', error);
    }
}

function buildAlbumsUrl() {
    const params = new URLSearchParams();

    const search = searchInput.value.trim();
    if (search) {
        params.set('search', search);
    }
    if (genreSelect.value) {
        params.set('genre', genreSelect.value);
    }
    if (artistSelect.value) {
        params.set('artist', artistSelect.value);
    }
    if (minPriceInput.value !== '') {
        params.set('min_price', minPriceInput.value);
    }
    if (maxPriceInput.value !== '') {
        params.set('max_price', maxPriceInput.value);
    }
    if (inStockInput.checked) {
        params.set('in_stock', 'true');
    }

    const queryString = params.toString();
    return queryString ? `${API_URL}/albums/?${queryString}` : `${API_URL}/albums/`;
}

function renderAlbumsGrid(albums) {
    albumsGrid.innerHTML = '';

    if (!albums.length) {
        catalogStatus.textContent = 'Платівок не знайдено';
        catalogStatus.hidden = false;
        return;
    }

    catalogStatus.hidden = true;

    albums.forEach((album) => {
        const tile = document.createElement('article');
        tile.className = 'album-tile';

        const cover = document.createElement('img');
        cover.className = 'album-tile-cover';
        cover.src = album.cover_url || DEFAULT_COVER;
        cover.alt = album.title;

        const body = document.createElement('div');
        body.className = 'album-tile-body';

        const title = document.createElement('h3');
        title.className = 'album-tile-title';
        title.textContent = album.title;

        const artist = document.createElement('p');
        artist.className = 'album-tile-artist';
        artist.textContent = album.artist_name || '';

        const footer = document.createElement('div');
        footer.className = 'album-tile-footer';

        const price = document.createElement('span');
        price.className = 'album-tile-price';
        price.textContent = `${album.price} грн`;
        footer.appendChild(price);

        if (!album.in_stock) {
            const outBadge = document.createElement('span');
            outBadge.className = 'out-of-stock-badge';
            outBadge.textContent = 'Немає в наявності';
            footer.appendChild(outBadge);
        }

        body.appendChild(title);
        body.appendChild(artist);
        body.appendChild(footer);

        tile.appendChild(cover);
        tile.appendChild(body);

        tile.addEventListener('click', () => openAlbumCard(album));
        albumsGrid.appendChild(tile);
    });
}

async function loadAlbums() {
    catalogStatus.textContent = 'Завантаження...';
    catalogStatus.hidden = false;
    albumsGrid.innerHTML = '';

    try {
        const response = await fetch(buildAlbumsUrl());
        if (!response.ok) {
            catalogStatus.textContent = 'Не вдалося завантажити платівки';
            return;
        }
        const albums = await response.json();
        renderAlbumsGrid(albums);
    } catch (error) {
        catalogStatus.textContent = 'Не вдалося завантажити платівки';
    }
}

function openAlbumCard(album) {
    cardInfo.innerHTML = '';

    const layout = document.createElement('div');
    layout.className = 'card-info-layout';

    const cover = document.createElement('img');
    cover.className = 'card-cover';
    cover.src = album.cover_url || DEFAULT_COVER;
    cover.alt = album.title;

    const details = document.createElement('div');
    details.className = 'card-details';

    const title = document.createElement('h2');
    title.textContent = album.title;

    const artist = document.createElement('p');
    artist.textContent = `Виконавець: ${album.artist_name || '—'}`;

    const genre = document.createElement('p');
    genre.textContent = `Жанр: ${album.genre_name || '—'}`;

    const year = document.createElement('p');
    year.textContent = `Рік: ${album.year || '—'}`;

    const price = document.createElement('p');
    price.className = 'card-price';
    price.textContent = `Ціна: ${album.price} грн`;

    const stock = document.createElement('p');
    stock.className = album.in_stock ? 'card-stock in-stock' : 'card-stock out-of-stock';
    stock.textContent = album.in_stock ? 'В наявності' : 'Немає в наявності';

    details.appendChild(title);
    details.appendChild(artist);
    details.appendChild(genre);
    details.appendChild(year);
    details.appendChild(price);
    details.appendChild(stock);

    layout.appendChild(cover);
    layout.appendChild(details);
    cardInfo.appendChild(layout);

    cardCart.innerHTML = '';
    cardNotify.innerHTML = '';
    cardTracks.innerHTML = '';
    cardReviews.innerHTML = '';

    if (typeof renderCartButton === 'function') {
        renderCartButton(album, cardCart);
    }
    if (typeof renderNotify === 'function') {
        renderNotify(album, cardNotify);
    }
    if (typeof renderTracks === 'function') {
        renderTracks(album, cardTracks);
    }
    if (typeof renderReviews === 'function') {
        renderReviews(album, cardReviews);
    }

    albumCard.hidden = false;
}

function closeAlbumCard() {
    albumCard.querySelectorAll('audio').forEach((audio) => {
        audio.pause();
    });
    albumCard.hidden = true;
}

filtersForm.addEventListener('submit', (event) => {
    event.preventDefault();
    loadAlbums();
});

resetFiltersButton.addEventListener('click', () => {
    filtersForm.reset();
    loadAlbums();
});

closeCardButton.addEventListener('click', closeAlbumCard);

albumCard.addEventListener('click', (event) => {
    if (event.target === albumCard) {
        closeAlbumCard();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !albumCard.hidden) {
        closeAlbumCard();
    }
});

loadFilterOptions('/genres/', genreSelect);
loadFilterOptions('/artists/', artistSelect);
loadAlbums();