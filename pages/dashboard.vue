<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>

<template>
  <layoutNavbar />
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