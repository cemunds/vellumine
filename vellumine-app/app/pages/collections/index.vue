<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Collection data
const collections = ref<any[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Fetch collections
async function fetchCollections() {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await $fetch("/api/v1/collections");
    collections.value = response;
  } catch (err) {
    console.error("Failed to fetch collections:", err);
    error.value = "Failed to load collections. Please try again.";
    collections.value = [];
  } finally {
    isLoading.value = false;
  }
}

// Sync collection
async function syncCollection(collectionId: string) {
  try {
    const response = await $fetch("/api/v1/collections/sync", {
      method: "POST",
      body: { collectionId },
    });

    // Show success notification
    useToast().add({
      title: "Sync Started",
      description: "Content synchronization has been started.",
      color: "success",
    });

    // Refresh collections to update sync status
    await fetchCollections();
  } catch (err) {
    console.error("Failed to sync collection:", err);
    useToast().add({
      title: "Sync Failed",
      description: "Failed to start synchronization.",
      color: "error",
    });
  }
}

// Navigate to create collection
function navigateToCreate() {
  router.push("/collections/create");
}

// Navigate to collection details
function navigateToDetails(collectionId: string) {
  router.push(`/collections/${collectionId}`);
}

// Refresh data
function refreshData() {
  fetchCollections();
}

onMounted(() => {
  fetchCollections();
});
</script>

<template>
  <UDashboardPanel id="collections">
    <template #header>
      <UDashboardNavbar title="Collections" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            icon="i-lucide-refresh-cw"
            size="md"
            variant="ghost"
            color="neutral"
            @click="refreshData"
            :loading="isLoading"
          />
          <UButton icon="i-lucide-plus" size="md" @click="navigateToCreate">
            Create Collection
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Error Message -->
        <UAlert
          v-if="error"
          icon="i-lucide-alert-circle"
          color="error"
          variant="soft"
          :description="error"
          @close="error = null"
        />

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <UProgress animation="carousel" />
        </div>

        <!-- Empty State -->
        <div v-else-if="collections.length === 0" class="text-center py-12">
          <div
            class="mx-auto mb-4 w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900 flex items-center justify-center"
          >
            <UIcon
              name="i-lucide-folder-open"
              class="w-8 h-8 text-primary-500 dark:text-primary-400"
            />
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No collections found
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            Get started by creating your first collection
          </p>
          <UButton @click="navigateToCreate" icon="i-lucide-plus">
            Create Collection
          </UButton>
        </div>

        <!-- Collections List -->
        <div v-else class="space-y-4">
          <UCard
            v-for="col in collections"
            :key="col.id"
            @click="navigateToDetails(col.id)"
            class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <UIcon
                  name="i-lucide-folder"
                  class="w-6 h-6 text-gray-500 dark:text-gray-400"
                />
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">
                    {{ col.name }}
                  </h3>
                  <p
                    v-if="col.description"
                    class="text-sm text-gray-500 dark:text-gray-400"
                  >
                    {{ col.description }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <!-- Sync Status -->
                <UBadge
                  v-if="col.syncStatus === 'syncing'"
                  variant="soft"
                  color="info"
                >
                  <UIcon name="i-lucide-loader-2" class="animate-spin mr-1" />
                  Syncing
                </UBadge>
                <UBadge
                  v-else-if="col.syncStatus === 'error'"
                  variant="soft"
                  color="error"
                >
                  <UIcon name="i-lucide-alert-circle" class="mr-1" />
                  Error
                </UBadge>
                <UBadge v-else variant="soft" color="success">
                  <UIcon name="i-lucide-check-circle" class="mr-1" />
                  Ready
                </UBadge>

                <!-- Content Count -->
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ col.postCount || 0 }} posts, {{ col.pageCount || 0 }} pages
                </span>
              </div>
            </div>

            <div
              v-if="col.ghostUrl"
              class="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
            >
              <UIcon name="i-lucide-globe" class="w-4 h-4" />
              <span>{{ col.ghostUrl }}</span>
            </div>

            <div
              v-if="col.lastSyncAt"
              class="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
            >
              <UIcon name="i-lucide-clock" class="w-4 h-4" />
              <span
                >Last synced:
                {{ new Date(col.lastSyncAt).toLocaleString() }}</span
              >
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
