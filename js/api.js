const API_URL = window.KEYHUB_API_URL;
const TOKEN_KEY = 'keyhub_token';
const USER_KEY = 'keyhub_user';

class ApiError extends Error {
    constructor(status, message, details = []) {
        super(message);
        this.status = status;
        this.details = details;
    }

    get userMessage() {
        return this.details[0]?.message || this.message;
    }
}

const session = {
    get token() {
        return localStorage.getItem(TOKEN_KEY);
    },
    get user() {
        try {
            return JSON.parse(localStorage.getItem(USER_KEY));
        } catch {
            return null;
        }
    },
    isLoggedIn() {
        return Boolean(this.token);
    },
    save({ token, user }) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    clear() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};

async function api(path, { method = 'GET', body, auth = false } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (auth && session.token) headers.Authorization = `Bearer ${session.token}`;

    let response;
    try {
        response = await fetch(API_URL + path, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        throw new ApiError(0, 'Server is unavailable. Please try again later.');
    }

    if (response.status === 204) return null;
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        if (response.status === 401 && auth) session.clear();
        throw new ApiError(response.status, data?.error || `Request failed (${response.status})`, data?.details || []);
    }
    return data;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatPrice(value) {
    return `$${Number(value).toFixed(2)}`;
}

function shortName(name, max = 40) {
    return name.length > max ? `${name.substring(0, max)}...` : name;
}

function loginUrl() {
    const current = window.location.pathname.split('/').pop() + window.location.search;
    return `enter.html?redirect=${encodeURIComponent(current || 'index.html')}`;
}
