<template>
  <div>
    <h1>Login Page</h1>
    <button @click="loginWithGoogle">Login with Google</button>
  </div>
</template>

<script setup>
  import { useAuth } from '@/composable/useAuth'
  const { loginWithGoogle } = useAuth()
</script>
