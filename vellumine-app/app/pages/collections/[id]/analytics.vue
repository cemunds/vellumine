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
const popularQueries = shallowRef<SearchResponse<object> | null>(null);
const noHits = shallowRef<SearchResponse<object> | null>(null);

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

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
          <HomeDateRangePicker v-model="range" class="-ms-1" />

          <HomePeriodSelect v-model="period" :range="range" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <HomeStats :period="period" :range="range" />
      <HomeChart :period="period" :range="range" />
      <HomeSales :period="period" :range="range" />
    </template>
  </UDashboardPanel>
</template>
