if (!isLoggedIn()) {
    window.location.href = 'login.html';
}
showHeader();

async function loadWishlist() {
    const list = document.getElementById('wishlist');
    list.innerHTML = '';

    const response = await authFetch('/wishlist/');
    if (!response.ok) {
        list.innerHTML = '<li>Не вдалося завантажити список бажаного</li>';
        return;
    }

    const items = await response.json();

    if (items.length === 0) {
        list.innerHTML = '<li>Список бажаного порожній</li>';
        return;
    }

    items.forEach((item) => {
        const album = item.album && typeof item.album === 'object' ? item.album : item;

        const li = document.createElement('li');
        const title = album.title || item.title || 'Платівка без назви';
        const price = album.price || item.price || 0;

        li.textContent = `${title} — ${price} грн`;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Видалити';
        deleteBtn.onclick = async () => {
            const delRes = await authFetch(`/wishlist/${item.id}/`, {
                method: 'DELETE',
            });
            if (delRes.ok) {
                li.remove();
            }
        };

        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

loadWishlist();