<template>
  <layoutNavbar />
  <pagesHomeHeroSection />
</template>

<script>
// if role is admin, show admin dashboard
definePageMeta({
  middleware: 'auth'
})

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