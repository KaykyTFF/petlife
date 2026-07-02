/**
 * Authentication Manager for LifePet
 */

import { login, register, checkEmail } from './services/authService.js';
import { Logger } from './utils/logger.js';

/**
 * Save auth data to localStorage
 */
export function setAuth(data) {
  if (data.access) localStorage.setItem("access_token", data.access);
  if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
  if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
}

/**
 * Remove auth data from localStorage
 */
export function clearAuthSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
}

/**
 * Redirect to login page
 */
export function redirectToLogin() {
  window.location.href = "/pages/login/index.html";
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!localStorage.getItem("access_token");
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

/**
 * Login user and save tokens
 */
export async function loginUser(email, password) {
  const { data, error } = await login(email, password);
  
  if (error) {
    return { error: error.detail || "Email ou senha incorretos." };
  }
  
  setAuth(data);
  Logger.auth('Login realizado', { email, userId: data.user?.id });
  return { success: true, user: data.user };
}

/**
 * Register user and save tokens
 */
export async function registerUser(userData) {
  const { data, error } = await register(userData);
  
  if (error) {
    // Format DRF errors
    let errorMessage = "Erro ao realizar cadastro.";
    if (typeof error === 'object') {
        const firstKey = Object.keys(error)[0];
        const val = error[firstKey];
        errorMessage = Array.isArray(val) ? val[0] : val;
    }
    return { error: errorMessage };
  }
  
  setAuth(data);
  Logger.auth('Cadastro realizado', { userId: data.user?.id });
  return { success: true, user: data.user };
}

/**
 * Check if email exists
 */
export async function checkEmailExists(email) {
  const { data, error } = await checkEmail(email);
  if (error) return { error: error.detail || "Erro ao verificar e-mail." };
  return { success: true, exists: data.exists, detail: data.detail };
}

/**
 * Logout user
 */
export function logoutUser() {
  Logger.auth('Logout realizado');
  clearAuthSession();
  redirectToLogin();
}

/**
 * Protect internal routes
 */
export function requireAuth() {
  if (!isAuthenticated()) {
    console.log('Access denied. Redirecting to login...');
    clearAuthSession();
    redirectToLogin();
    return false;
  }
  return true;
}

/**
 * Redirect already authenticated users from public pages to dashboard
 */
export function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    console.log('Already authenticated. Redirecting to dashboard...');
    window.location.href = "/pages/dashboard/index.html";
  }
}
