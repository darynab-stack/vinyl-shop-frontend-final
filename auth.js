const API_URL = 'http://127.0.0.1:8000/api';

function isLoggedIn() {
    return localStorage.getItem('refresh') !== null;
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function goToLogin() {
    const page = window.location.pathname.split('/').pop();
    window.location.href = 'login.html?next=' + page;
}

function requireAuth() {
    if (!isLoggedIn()) {
        goToLogin();
        return false;
    }
    return true;
}

function showHeader() {
    const loggedIn = isLoggedIn();
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) {
        userNameEl.textContent = localStorage.getItem('username') || '';
        userNameEl.hidden = !loggedIn;
    }
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.hidden = !loggedIn;
        logoutBtn.onclick = logout;
    }
    const loginLink = document.getElementById('login-link');
    if (loginLink) {
        loginLink.hidden = loggedIn;
    }
    const registerLink = document.getElementById('register-link');
    if (registerLink) {
        registerLink.hidden = loggedIn;
    }
}

async function refreshToken() {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) {
        return false;
    }

    const response = await fetch(API_URL + '/auth/refresh/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({refresh: refresh}),
    });

    if (!response.ok) {
        return false;
    }

    const data = await response.json();
    localStorage.setItem('access', data.access);
    return true;
}

async function authFetch(path, options = {}) {
    const send = function () {
        return fetch(API_URL + path, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
                Authorization: 'Bearer ' + localStorage.getItem('access'),
            },
        });
    };

    let response = await send();

    if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
            response = await send();
        } else {
            localStorage.clear();
            goToLogin();
            return response;
        }
    }

    return response;
}