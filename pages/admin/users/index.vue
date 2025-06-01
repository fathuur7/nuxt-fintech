<template>
  <main>
    <PagesAdminUserManegment />
  </main>
</template>

<script>
definePageMeta({
  title: 'User Management',
  layout: 'admin',
  middleware: 'auth',
});
</script>