<template>
    <div>
        <h1>Admin Page</h1>
        <p>Welcome to the admin dashboard!</p>
        <button>
        <NuxtLink to="/auth/login">Login</NuxtLink>
        </button>
    </div>
</template>

<script lang="ts">
definePageMeta({
  title: 'User Management',
  layout: 'admin',
  middleware: 'auth',
});
</script>