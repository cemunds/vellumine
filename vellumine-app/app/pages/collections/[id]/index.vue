<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const collectionId = route.params.id as string;

const { data: collection, refresh } = await useLazyFetch(
  `/api/v1/collections/${collectionId}`,
);
// const { data: syncStatus } = await useLazyFetch(`/api/v1/collections/${collectionId}/sync`)

const scriptTag = computed(() => {
  if (!collection.value) return "";

  return `<!-- Vellumine Integration -->
<script src="https://app.vellumine.com/search.min.js"
  id="vellumine"
  data-api-key="${collection.value.typesenseSearchKey}"
  data-collection-id="${collection.value.id}"><\/script>`;
});

// Sync collection
async function syncCollection() {
  try {
    const response = await $fetch("/api/v1/sync", {
      method: "POST",
      body: { collectionId },
    });

    useToast().add({
      title: "Sync Started",
      description: "Content synchronization has been started.",
      color: "success",
    });

    // Refresh sync status
    await refresh();
  } catch (err) {
    console.error("Failed to sync collection:", err);
    useToast().add({
      title: "Sync Failed",
      description:
        (err as any)?.statusMessage || "Failed to start synchronization.",
      color: "error",
    });
  }
}

// Copy script tag to clipboard
function copyScriptTag() {
  if (!scriptTag.value) return;

  navigator.clipboard
    .writeText(scriptTag.value)
    .then(() => {
      useToast().add({
        title: "Copied",
        description: "Script tag copied to clipboard.",
        color: "success",
      });
    })
    .catch(() => {
      useToast().add({
        title: "Copy Failed",
        description: "Failed to copy script tag.",
        color: "error",
      });
    });
}

const user = useSupabaseUser();

const basicCheckoutUrl = computed(() => {
  return `/api/v1/checkout?products=8364631f-ff72-4edf-9f0e-d2b9b9c1f499&customerName=Chris&customerEmail=${user.value?.email}&customerExternalId=${user.value?.sub}`;
});
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Home">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <!-- <UButton icon="i-lucide-refresh-cw" @click="syncCollection" :loading="syncStatus?.status === 'syncing'">
            {{ syncStatus?.status === "syncing" ? "Syncing..." : "Sync Now" }}
          </UButton> -->
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Content -->
        <div class="space-y-6">
          <div class="space-y-4">
            <UCard>
              <template #header>
                <h3 class="font-medium text-gray-900 dark:text-white">
                  Collection Information
                </h3>
              </template>

              <!-- <div>
                <form method="POST" :action="basicCheckoutUrl">
                  <button type="submit">Buy Basic</button>
                </form>
              </div> -->

              <div class="space-y-4">
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Name
                  </p>
                  <p class="text-gray-900 dark:text-white">
                    {{ collection?.name }}
                  </p>
                </div>

                <div v-if="collection?.description">
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Description
                  </p>
                  <p class="text-gray-900 dark:text-white">
                    {{ collection?.description }}
                  </p>
                </div>

                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Created At
                  </p>
                  <p class="text-gray-900 dark:text-white">
                    {{
                      collection?.createdAt
                        ? new Date(collection.createdAt).toLocaleString()
                        : "N/A"
                    }}
                  </p>
                </div>

                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Updated At
                  </p>
                  <p class="text-gray-900 dark:text-white">
                    {{
                      collection?.updatedAt
                        ? new Date(collection.updatedAt).toLocaleString()
                        : "N/A"
                    }}
                  </p>
                </div>

                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Webhook URL
                  </p>
                  <p class="text-gray-900 dark:text-white">
                    {{
                      `https://app.vellumine.com/webhook/sync?collectionId=${collection?.id}&webhookSecret=${collection?.webhookSecret}`
                    }}
                  </p>
                </div>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="font-medium text-gray-900 dark:text-white">
                  Content Statistics
                </h3>
              </template>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Posts Indexed
                  </p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ collection?.postCount || 0 }}
                  </p>
                </div>

                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Pages Indexed
                  </p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ collection?.pageCount || 0 }}
                  </p>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Sync Status Tab -->
          <!-- <div class="space-y-4">
            <UCard>
              <template #header>
                <h3 class="font-medium text-gray-900 dark:text-white">
                  Sync Status
                </h3>
              </template>

              <div class="space-y-4">
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Current Status
                  </p>
                  <div class="flex items-center gap-2">
                    <UBadge v-if="syncStatus?.status === 'syncing'" variant="soft" color="info">
                      <UIcon name="i-lucide-loader-2" class="animate-spin mr-1" />
                      Syncing
                    </UBadge>
                    <UBadge v-else-if="syncStatus?.status === 'error'" variant="soft" color="error">
                      <UIcon name="i-lucide-alert-circle" class="mr-1" />
                      Error
                    </UBadge>
                    <UBadge v-else variant="soft" color="success">
                      <UIcon name="i-lucide-check-circle" class="mr-1" />
                      Ready
                    </UBadge>
                  </div>
                </div>

                <div v-if="syncStatus?.error">
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Error Message
                  </p>
                  <UAlert icon="i-lucide-alert-circle" color="error" variant="soft" :description="syncStatus.error" />
                </div>

                <div v-if="syncStatus?.lastSyncAt">
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Last Sync
                  </p>
                  <p class="text-gray-900 dark:text-white">
                    {{ new Date(syncStatus.lastSyncAt).toLocaleString() }}
                  </p>
                </div>

                <div v-if="syncStatus?.progress">
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Progress
                  </p>
                  <div class="space-y-2">
                    <div>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        Posts
                      </p>
                      <p class="text-sm text-gray-900 dark:text-white">
                        {{ syncStatus.progress.posts.processed }} /
                        {{ syncStatus.progress.posts.total }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        Pages
                      </p>
                      <p class="text-sm text-gray-900 dark:text-white">
                        {{ syncStatus.progress.pages.processed }} /
                        {{ syncStatus.progress.pages.total }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
          </div> -->

          <!-- Integration Tab -->
          <div class="space-y-4">
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="font-medium text-gray-900 dark:text-white">
                    Search Integration
                  </h3>
                  <UButton
                    icon="i-lucide-copy"
                    size="xs"
                    variant="ghost"
                    @click="copyScriptTag"
                  >
                    Copy Script
                  </UButton>
                </div>
              </template>

              <div class="space-y-4">
                <UTextarea
                  v-model="scriptTag"
                  :rows="10"
                  readonly
                  placeholder="Generating script tag..."
                  class="font-mono text-xs"
                />

                <UAlert icon="i-lucide-info" color="info" variant="soft">
                  <template #description>
                    <div class="space-y-2">
                      <p>To integrate search into your Ghost blog:</p>
                      <ol class="list-decimal list-inside space-y-1">
                        <li>Copy the script tag above</li>
                        <li>
                          Paste it into your Ghost theme's
                          <code>default.hbs</code> file
                        </li>
                        <li>Place it just before the closing tag</li>
                        <li>Save and upload your theme</li>
                        <li>Test the search by pressing Ctrl+K on your blog</li>
                      </ol>
                    </div>
                  </template>
                </UAlert>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
