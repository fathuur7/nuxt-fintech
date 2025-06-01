export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('token').value; // sesuaikan dengan sistem auth kamu
  const role = useCookie('role').value;   // misalnya role disimpan dalam cookie

  // Jika tidak login, arahkan ke halaman login
  if (!token) {
    return navigateTo('/auth/login');
  }
  // Jika role tidak sesuai, jika user masuk ke http:localhost:3001/admin maka akan diarahkan ke halaman admin
  if (to.path.startsWith('/admin') && role !== 'admin') {
    console.log(role)
    return navigateTo('/'); // arahkan ke halaman utama jika bukan admin
  }
});
