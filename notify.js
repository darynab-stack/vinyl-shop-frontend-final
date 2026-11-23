async function isSubscribed(albumId) {
    const response = await authFetch('/subscriptions/');
    if (!response.ok) {
        return false;
    }

    const subscriptions = await response.json();
    return subscriptions.some((subscription) => subscription.album === albumId);
}

async function renderNotify(album, container) {
    if (album.in_stock) {
        return;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'notify-button';
    button.textContent = 'Повідомити про наявність';

    const message = document.createElement('p');
    message.className = 'notify-message';

    container.appendChild(button);
    container.appendChild(message);

    if (!isLoggedIn()) {
        button.onclick = () => {
            window.location.href = 'login.html?next=index.html';
        };
        return;
    }

    let subscribed = await isSubscribed(album.id);

    const showState = () => {
        if (subscribed) {
            button.textContent = 'Скасувати сповіщення';
            message.textContent = 'Ми надішлемо вам лист, щойно платівка з\'явиться.';
        } else {
            button.textContent = 'Повідомити про наявність';
            message.textContent = '';
        }
    };

    showState();

    button.onclick = async () => {
        button.disabled = true;

        const response = await authFetch(`/albums/${album.id}/subscribe/`, {
            method: subscribed ? 'DELETE' : 'POST',
        });

        if (response.ok) {
            subscribed = !subscribed;
            showState();
        } else {
            message.textContent = 'Не вдалося, спробуйте ще раз.';
        }

        button.disabled = false;
    };
}