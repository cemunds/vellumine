const VELLUMINE_ACTIVE_COLLECTION_KEY = "VELLUMINE_ACTIVE_COLLECTION";

export const useActiveCollectionStore = defineStore("activeCollection", () => {
  const activeCollection = useLocalStorage(VELLUMINE_ACTIVE_COLLECTION_KEY, {
    id: "",
  });

  const setActiveCollection = (id: string) => {
    activeCollection.value.id = id;
  };

  return {
    activeCollection: readonly(activeCollection),
    setActiveCollection,
  };
});
