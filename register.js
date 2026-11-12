if (isLoggedIn()) {
    window.location.href = 'index.html';
}
showHeader();

const params = new URLSearchParams(window.location.search);
if (params.get('reason') === 'wishlist') {
    const notice = document.getElementById('register-notice');
    if (notice) {
        notice.textContent = 'Зареєструйтеся, щоб додавати платівки до бажаного.';
        notice.hidden = false;
    }
}

const fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2'];

document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    document.querySelectorAll('.error').forEach((element) => {
        element.textContent = '';
    });

    const data = {};
    fields.forEach((name) => {
        const input = document.getElementById(name);
        if (input) {
            data[name] = name.startsWith('password') ? input.value : input.value.trim();
        }
    });

    const response = await fetch(API_URL + '/auth/register/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    });

    if (response.ok) {
        window.location.href = 'login.html';
        return;
    }

    const errors = await response.json();
    Object.keys(errors).forEach((field) => {
        const box = document.getElementById('error-' + field);
        if (box) {
            const errorValue = errors[field];
            box.textContent = Array.isArray(errorValue) ? errorValue.join(' ') : errorValue;
        }
    });
});