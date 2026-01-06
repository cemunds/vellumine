<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Form data
const form = ref({
  name: "",
  description: "",
  ghostUrl: "",
  ghostContentApiKey: "",
  ghostAdminApiKey: "",
});

// Form state
const isLoading = ref(false);
const error = ref<string | null>(null);
const showApiKeyInstructions = ref(false);

// Validate Ghost URL
function validateGhostUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

// Create collection
async function createCollection() {
  // Validate form
  if (!form.value.name.trim()) {
    error.value = "Collection name is required";
    return;
  }

  if (form.value.ghostUrl && !validateGhostUrl(form.value.ghostUrl)) {
    error.value = "Please enter a valid Ghost URL (http:// or https://)";
    return;
  }

  if (form.value.ghostUrl && !form.value.ghostContentApiKey.trim()) {
    error.value =
      "Ghost Content API key is required when Ghost URL is provided";
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;

    const response = await $fetch("/api/v1/collections", {
      method: "POST",
      body: {
        name: form.value.name,
        description: form.value.description,
        ghostUrl: form.value.ghostUrl,
        ghostContentApiKey: form.value.ghostContentApiKey,
        ghostAdminApiKey: form.value.ghostAdminApiKey,
      },
    });

    useToast().add({
      title: "Collection Created",
      description: "Your collection has been created successfully.",
      color: "success",
    });

    // Navigate to collection details
    router.push(`/collections/${response.id}`);
  } catch (err: any) {
    console.error("Failed to create collection:", err);
    error.value =
      err.statusMessage || "Failed to create collection. Please try again.";
    useToast().add({
      title: "Creation Failed",
      description: error.value || "Failed to create collection",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
}

// Ghost API key instructions
const ghostApiKeyInstructions = `
## How to Generate Ghost Content API Key

1. **Log in** to your Ghost admin panel
2. **Navigate** to Settings → Advanced → Integrations
3. **Click** "Add custom integration"
4. **Name** your integration (e.g., "GhostSearch")
5. **Click** "Create"
6. **Copy** the "Content API Key" (not the Admin API Key)
7. **Paste** it into the form above

## Important Notes

- The Content API Key allows read-only access to your posts and pages
- Keep this key secure and don't share it publicly
- If you want automatic webhook setup, you'll also need the Admin API Key
`;
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Create Collection" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            type="submit"
            form="collection-form"
            :loading="isLoading"
            icon="i-lucide-save"
          >
            Create Collection
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- Error Message -->
        <UAlert
          v-if="error"
          icon="i-lucide-alert-circle"
          color="error"
          variant="soft"
          :description="error"
          @close="error = null"
        />

        <UForm
          id="collection-form"
          @submit.prevent="createCollection"
          class="space-y-6"
        >
          <!-- Collection Information -->
          <UCard>
            <template #header>
              <h3 class="font-medium text-gray-900 dark:text-white">
                Collection Information
              </h3>
            </template>

            <div class="space-y-4">
              <UFormField label="Collection Name" required>
                <UInput v-model="form.name" placeholder="My Blog Search" />
              </UFormField>

              <UFormField
                label="Description"
                hint="Optional description for your collection"
              >
                <UTextarea
                  v-model="form.description"
                  placeholder="Description of your collection"
                />
              </UFormField>
            </div>
          </UCard>

          <!-- Ghost CMS Configuration -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="font-medium text-gray-900 dark:text-white">
                  Ghost CMS Configuration
                </h3>
                <UButton
                  variant="ghost"
                  size="xs"
                  @click="showApiKeyInstructions = !showApiKeyInstructions"
                >
                  {{ showApiKeyInstructions ? "Hide" : "Show" }} Instructions
                </UButton>
              </div>
            </template>

            <div class="space-y-4">
              <UFormField
                label="Ghost Blog URL"
                hint="e.g., https://your-blog.com"
              >
                <UInput
                  v-model="form.ghostUrl"
                  placeholder="https://your-blog.com"
                />
              </UFormField>

              <UFormField label="Ghost Content API Key" required>
                <UInput
                  v-model="form.ghostContentApiKey"
                  type="password"
                  placeholder="Content API Key"
                />
              </UFormField>

              <UFormField
                label="Ghost Admin API Key (Optional)"
                hint="Required for automatic webhook setup"
              >
                <UInput
                  v-model="form.ghostAdminApiKey"
                  type="password"
                  placeholder="Admin API Key"
                />
              </UFormField>

              <!-- API Key Instructions -->
              <UAlert
                v-if="showApiKeyInstructions"
                icon="i-lucide-info"
                color="info"
                variant="soft"
                :description="ghostApiKeyInstructions"
                class="mt-4"
              />
            </div>
          </UCard>

          <!-- Submit Button -->
          <div class="flex justify-end">
            <UButton
              type="submit"
              :loading="isLoading"
              icon="i-lucide-save"
              size="lg"
            >
              Create Collection
            </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </UDashboardPanel>
</template>
