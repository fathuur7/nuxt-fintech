<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>

<template>
  <layoutNavbar />
  <pagesHomeHeroSection />
</template>

<script>
useHead({
  title: 'Dashboard',
  meta: [
    {
      name: 'description',
      content: 'Dashboard page'
    }
  ]
})
</script>