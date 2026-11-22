function setMessage(text) {
    document.getElementById('cart-message').textContent = text;
}

function makeButton(text, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.onclick = onClick;
    return button;
}

async function changeQuantity(item, quantity) {
    const response = await authFetch(`/cart/${item.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({quantity: quantity}),
    });
    if (!response.ok) {
        setMessage('Не вдалося змінити кількість');
        return;
    }
    loadCart();
}

async function removeItem(item) {
    const response = await authFetch(`/cart/${item.id}/`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        setMessage('Не вдалося видалити позицію');
        return;
    }
    loadCart();
}

async function loadCart() {
    const list = document.getElementById('cart-items');
    const total = document.getElementById('cart-total');
    list.innerHTML = '';
    total.textContent = '';
    setMessage('');

    const response = await authFetch('/cart/');
    if (!response.ok) {
        setMessage('Не вдалося завантажити кошик');
        return;
    }

    const data = await response.json();

    if (data.items.length === 0) {
        document.getElementById('cart-message').innerHTML =
            'Кошик порожній. <a href="index.html">Перейти до каталогу</a>';
        return;
    }

    data.items.forEach((item) => {
        const li = document.createElement('li');
        const sum = Number(item.album_price) * item.quantity;

        const info = document.createElement('span');
        info.textContent =
            `${item.album_title} — ${item.album_price} грн × ${item.quantity} = ${sum.toFixed(2)} грн `;
        li.appendChild(info);

        const minus = makeButton('−', () => changeQuantity(item, item.quantity - 1));
        minus.disabled = item.quantity <= 1;
        li.appendChild(minus);

        li.appendChild(makeButton('+', () => changeQuantity(item, item.quantity + 1)));
        li.appendChild(makeButton('Видалити', () => removeItem(item)));

        list.appendChild(li);
    });

    total.textContent = `Разом: ${Number(data.total).toFixed(2)} грн`;
}

if (requireAuth()) {
    showHeader();
    loadCart();
}