<script setup lang="ts">
import { sub } from "date-fns";
import type { DropdownMenuItem } from "@nuxt/ui";
import type { Period, Range } from "~/types";
import { Client as TypesenseClient } from "typesense";
import type { SearchResponse } from "typesense/lib/Typesense/Documents";

const { isNotificationsSlideoverOpen } = useDashboard();
const {
  public: { typesenseProtocol, typesenseHost, typesensePort },
} = useRuntimeConfig();
const { activeCollection } = storeToRefs(useActiveCollectionStore());

let typesenseClient: TypesenseClient | null = null;
const popularQueries = shallowRef<SearchResponse<{
  count: number;
  id: string;
  q: string;
}> | null>(null);
const noHits = shallowRef<SearchResponse<{
  count: number;
  id: string;
  q: string;
}> | null>(null);

const totalSearchQueries = computed(() => {
  const popularSum =
    popularQueries.value?.hits?.reduce(
      (sum, hit) => sum + hit.document.count,
      0,
    ) || 0;
  const noHitsSum =
    noHits.value?.hits?.reduce((sum, hit) => sum + hit.document.count, 0) || 0;
  return popularSum + noHitsSum;
});

const totalNoHitsQueries = computed(() => {
  return (
    noHits.value?.hits?.reduce((sum, hit) => sum + hit.document.count, 0) || 0
  );
});

watchEffect(() => {
  if (!activeCollection.value) return;

  typesenseClient = new TypesenseClient({
    nodes: [
      {
        protocol: typesenseProtocol,
        host: typesenseHost,
        port: typesensePort,
      },
    ],
    apiKey: activeCollection.value.typesenseSearchKey,
    connectionTimeoutSeconds: 30,
  });
});

const fetchAnalyticsData = async () => {
  if (!typesenseClient) return;
  if (!activeCollection.value) return;

  const collectionId = activeCollection.value.id;

  const docsCollection = typesenseClient.collections(collectionId);
  const popularQueriesCollection = typesenseClient.collections(
    `${collectionId}_popular_queries`,
  );
  const noHitsCollection = typesenseClient.collections(
    `${collectionId}_no_hits_queries`,
  );

  popularQueries.value = await popularQueriesCollection.documents().search({
    q: "*",
    query_by: "q",
    sort_by: "count:desc",
  });
  noHits.value = await noHitsCollection.documents().search({
    q: "*",
    query_by: "q",
    sort_by: "count:desc",
  });
};

const items = [
  [
    {
      label: "New mail",
      icon: "i-lucide-send",
      to: "/inbox",
    },
    {
      label: "New customer",
      icon: "i-lucide-user-plus",
      to: "/customers",
    },
  ],
] satisfies DropdownMenuItem[][];

const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date(),
});
const period = ref<Period>("daily");

fetchAnalyticsData();
</script>

<template>
  <UDashboardPanel id="analytics">
    <template #header>
      <UDashboardNavbar title="Analytics">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Total Search Queries</h3>
          </template>
          <div class="p-4 text-center">
            <span class="text-3xl font-bold">{{ totalSearchQueries }}</span>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Total No Hits Queries</h3>
          </template>
          <div class="p-4 text-center">
            <span class="text-3xl font-bold">{{ totalNoHitsQueries }}</span>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Popular Queries</h3>
          </template>
          <div
            v-for="hit in popularQueries?.hits"
            :key="hit.document.id"
            class="p-4 border-b last:border-b-0"
          >
            <div class="flex justify-between items-center">
              <span class="font-medium">{{ hit.document.q }}</span>
              <UBadge color="success" variant="soft">{{
                hit.document.count
              }}</UBadge>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">No Hits Queries</h3>
          </template>
          <div
            v-for="hit in noHits?.hits"
            :key="hit.document.id"
            class="p-4 border-b last:border-b-0"
          >
            <div class="flex justify-between items-center">
              <span class="font-medium">{{ hit.document.q }}</span>
              <UBadge color="error" variant="soft">{{
                hit.document.count
              }}</UBadge>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
