if (isLoggedIn()) {
      window.location.href = next && next.endsWith('.html') && !next.includes('/') ? next : 'index.html';
}
showHeader();

document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const errorEl = document.getElementById('error');
    if (errorEl) {
        errorEl.textContent = '';
    }

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const response = await fetch(API_URL + '/auth/login/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: username, password: password}),
    });

    if (!response.ok) {
        if (errorEl) {
            errorEl.textContent = 'Неправильний username або пароль';
        }
        return;
    }

    const data = await response.json();
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('username', username);

    const next = new URLSearchParams(window.location.search).get('next');
    window.location.href = next || 'index.html';
});