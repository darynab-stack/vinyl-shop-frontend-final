function formatStars(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function buildReviewForm(text, rating, submitLabel, onSubmit, onCancel) {
    const form = document.createElement('form');
    form.className = 'review-form';

    const textInput = document.createElement('textarea');
    textInput.placeholder = 'Ваші враження від платівки';
    textInput.value = text;

    const ratingSelect = document.createElement('select');
    for (let value = 5; value >= 1; value--) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = `${formatStars(value)} (${value})`;
        ratingSelect.appendChild(option);
    }
    ratingSelect.value = rating;

    const error = document.createElement('p');
    error.className = 'error';

    const actions = document.createElement('div');
    actions.className = 'review-form-actions';

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = submitLabel;
    actions.appendChild(submitButton);

    if (onCancel) {
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'secondary-button';
        cancelButton.textContent = 'Скасувати';
        cancelButton.onclick = onCancel;
        actions.appendChild(cancelButton);
    }

    form.appendChild(textInput);
    form.appendChild(ratingSelect);
    form.appendChild(error);
    form.appendChild(actions);

    form.onsubmit = async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        error.textContent = '';

        const response = await onSubmit({
            text: textInput.value.trim(),
            rating: Number(ratingSelect.value),
        });

        if (!response.ok) {
            const data = await response.json();
            if (data.error) {
                error.textContent = data.error;
            } else if (data.text) {
                error.textContent = 'Напишіть текст відгуку.';
            } else {
                error.textContent = 'Не вдалося зберегти відгук.';
            }
            submitButton.disabled = false;
        }
    };

    return form;
}

function createReviewItem(review, isOwn, reload) {
    const item = document.createElement('div');
    item.className = 'review';

    const header = document.createElement('div');
    header.className = 'review-header';

    const author = document.createElement('strong');
    author.textContent = review.username;

    const stars = document.createElement('span');
    stars.className = 'review-stars';
    stars.textContent = formatStars(review.rating);

    const date = document.createElement('span');
    date.className = 'review-date';
    date.textContent = new Date(review.created_at).toLocaleDateString('uk-UA');

    header.appendChild(author);
    header.appendChild(stars);
    header.appendChild(date);

    const text = document.createElement('p');
    text.className = 'review-text';
    text.textContent = review.text;

    item.appendChild(header);
    item.appendChild(text);

    if (!isOwn) {
        return item;
    }

    const actions = document.createElement('div');
    actions.className = 'review-actions';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'secondary-button';
    editButton.textContent = 'Редагувати';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'secondary-button';
    deleteButton.textContent = 'Видалити';

    editButton.onclick = () => {
        const form = buildReviewForm(
            review.text,
            review.rating,
            'Зберегти',
            async (data) => {
                const response = await authFetch(`/reviews/${review.id}/`, {
                    method: 'PATCH',
                    body: JSON.stringify(data),
                });
                if (response.ok) {
                    reload();
                }
                return response;
            },
            () => reload(),
        );
        item.innerHTML = '';
        item.appendChild(form);
    };

    deleteButton.onclick = async () => {
        if (!confirm('Видалити ваш відгук?')) {
            return;
        }

        const response = await authFetch(`/reviews/${review.id}/`, {
            method: 'DELETE',
        });
        if (response.ok) {
            reload();
        }
    };

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    item.appendChild(actions);
    return item;
}

async function renderReviews(album, container) {
    container.innerHTML = '';

    const title = document.createElement('h3');
    title.className = 'reviews-title';
    title.textContent = 'Відгуки';

    const list = document.createElement('div');
    list.className = 'review-list';
    list.textContent = 'Завантаження...';

    const formBox = document.createElement('div');

    container.appendChild(title);
    container.appendChild(list);
    container.appendChild(formBox);

    const reload = () => renderReviews(album, container);

    const response = await fetch(`${API_URL}/albums/${album.id}/reviews/`);
    if (!response.ok) {
        list.textContent = 'Не вдалося завантажити відгуки.';
        return;
    }

    const reviews = await response.json();
    const username = localStorage.getItem('username');
    let hasOwnReview = false;

    list.innerHTML = '';
    if (reviews.length === 0) {
        list.textContent = 'Відгуків ще немає. Будьте першими!';
    }

    reviews.forEach((review) => {
        const isOwn = isLoggedIn() && review.username === username;
        if (isOwn) {
            hasOwnReview = true;
        }
        list.appendChild(createReviewItem(review, isOwn, reload));
    });

    if (!isLoggedIn()) {
        const hint = document.createElement('p');
        hint.className = 'review-hint';
        hint.innerHTML = '<a href="login.html?next=index.html">Увійдіть</a>, щоб залишити відгук.';
        formBox.appendChild(hint);
        return;
    }

    if (hasOwnReview) {
        return;
    }

    const formTitle = document.createElement('h4');
    formTitle.textContent = 'Написати відгук';
    formBox.appendChild(formTitle);
    formBox.appendChild(
        buildReviewForm('', 5, 'Надіслати', async (data) => {
            const response = await authFetch(`/albums/${album.id}/reviews/`, {
                method: 'POST',
                body: JSON.stringify(data),
            });
            if (response.ok) {
                reload();
            }
            return response;
        }),
    );
}