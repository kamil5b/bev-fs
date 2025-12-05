<template>
  <DefaultLayout>
    <div class="space-y-4">
      <h1 class="text-3xl font-bold">Users</h1>
      <UserList />
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import UserList from "@/components/feature/UserList.vue";
</script>
