<template>
  <div>
    <p>Pesan dari backend: {{ message }}</p>
  </div>
</template>

<script setup>
const { data, error } = await useFetch('http://localhost:3001/')
const message = data.value
</script>
