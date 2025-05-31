export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('token').value; // sesuaikan dengan sistem auth kamu
  const role = useCookie('role').value;   // misalnya role disimpan dalam cookie

  // Jika tidak login, arahkan ke halaman login
  if (!token) {
    return navigateTo('/auth/login');
  }
});
