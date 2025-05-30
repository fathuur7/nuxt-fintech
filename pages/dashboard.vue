<template>
  <div>
    <h1>Dashboard</h1>
    <p>Selamat datang!</p>
  </div>
</template>

<script setup>
const token = useCookie('token')

if (!token.value) {
  navigateTo('/')
}
</script>
