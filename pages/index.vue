<template>
  <div>
    <p v-if="message">Pesan dari backend: {{ message }}</p>
    <p v-else>Memuat...</p>
  </div>
</template>

<script setup>
const { data, error } = await useFetch('/api/hello?name=Nuxt')

const message = data.value?.message
</script>
