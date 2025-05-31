<template>
    <h1>Admin</h1>
    <p>Ini adalah halaman admin yang hanya bisa diakses oleh pengguna yang sudah login sebagai admin.</p>
</template>

<script setup lang="ts">
    type User = {
        id: number;
        name: string;
        email: string;
        role: 'admin' | 'user';
        balance: number;
        isActive: boolean;
    };

    import { useProfile } from '@/composables/getProfile';
    const { user, error, fetchProfile } = useProfile();
    definePageMeta({
        middleware: 'auth',
        title: 'Admin Page',
        meta: [
            {
                name: 'description',
                content: 'Halaman admin yang hanya bisa diakses oleh pengguna yang sudah login sebagai admin.'
            }
        ]
    });
</script>