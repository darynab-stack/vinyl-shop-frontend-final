async function postAndMark(path, body, button) {
    if (!isLoggedIn()) {
        window.location.href = 'register.html?reason=wishlist';
        return;
    }

    const response = await authFetch(path, {
        method: 'POST',
        body: JSON.stringify(body),
    });

    button.textContent = response.ok ? 'Додано' : 'Помилка';
}

function renderCartButton(album, container) {
    if (album.in_stock !== false) {
        const cartButton = document.createElement('button');
        cartButton.type = 'button';
        cartButton.textContent = 'В кошик';
        cartButton.onclick = () =>
            postAndMark('/cart/', {album: album.id, quantity: 1}, cartButton);
        container.appendChild(cartButton);
    }

    const wishlistButton = document.createElement('button');
    wishlistButton.type = 'button';
    wishlistButton.textContent = 'У бажане';
    wishlistButton.onclick = () =>
        postAndMark('/wishlist/', {album: album.id}, wishlistButton);
    container.appendChild(wishlistButton);
}