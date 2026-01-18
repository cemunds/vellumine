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
      <div>
        <div v-for="hit in popularQueries?.hits">
          <div>{{ hit.document.q }}</div>
          <div>{{ hit.document.count }}</div>
        </div>
      </div>

      <div>
        <div v-for="hit in noHits?.hits">
          <div>{{ hit.document.q }}</div>
          <div>{{ hit.document.count }}</div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
