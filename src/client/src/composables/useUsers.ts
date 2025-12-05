import { ref } from "vue";
import { usersApi } from "@/api/users.api";
import type { UsersListRequest } from "@shared/users/request.users";

export function useUsers() {
  const items = ref([]);
  const meta = ref({ total: 0, page: 1, perPage: 10, totalPages: 0 });
  const loading = ref(false);
  const error = ref<string | null>(null);

  const state = ref<UsersListRequest>({
    page: 1,
    perPage: 10,
    sortBy: "id",
    sortOrder: "asc",
    q: undefined,
    role: undefined
  });

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      const resp = await usersApi.list(state.value);
      if (!resp.success) {
        error.value = resp.error ?? "Unknown error";
        items.value = [];
      } else {
        items.value = resp.data!.items;
        meta.value = resp.data!.meta;
      }
    } catch (e: any) {
      error.value = e.message;
      items.value = [];
    } finally {
      loading.value = false;
    }
  }

  function setPage(p: number) { state.value.page = p; void load(); }
  function setPerPage(n: number) { state.value.perPage = n; state.value.page = 1; void load(); }
  function setSort(by: string, order: "asc"|"desc") { state.value.sortBy = by; state.value.sortOrder = order; void load(); }
  function setFilter(q?: string, role?: string) { state.value.q = q; state.value.role = role; state.value.page = 1; void load(); }

  return { items, meta, loading, error, load, setPage, setPerPage, setSort, setFilter, state };
}
