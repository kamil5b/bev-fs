<template>
  <BaseCard>
    <h2 class="mb-4 text-lg font-bold">Users</h2>
    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else>
      <table class="w-full text-sm">
        <thead><tr><th class="text-left">Name</th><th class="text-left">Role</th></tr></thead>
        <tbody>
          <tr v-for="user of items" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.role }}</td>
          </tr>
        </tbody>
      </table>
      <div class="mt-4 flex gap-2">
        <BaseButton @click="load" :disabled="loading">Refresh</BaseButton>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { useUsers } from "@/composables/useUsers";
import BaseCard from "@/components/base/Card.vue";
import BaseButton from "@/components/base/Button.vue";

const { items, loading, error, load } = useUsers();
load();
</script>
