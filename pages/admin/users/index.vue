<template>
  <main>
    <AdminUserManagement />
  </main>
</template>

definePageMeta({
  title: 'User Management',
  layout: 'admin',
  middleware: 'auth'
})
</script>
<script setup>
import AdminUserManagement from '~/components/pages/Admin/UserManagement.vue'
<script>
definePageMeta({
  title: 'User Management',
  layout: 'admin',
  middleware: 'auth',
});
</script>