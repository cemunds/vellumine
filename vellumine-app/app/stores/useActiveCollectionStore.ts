const VELLUMINE_ACTIVE_COLLECTION_KEY = "VELLUMINE_ACTIVE_COLLECTION";

export const useActiveCollectionStore = defineStore("activeCollection", () => {
  const activeCollection = useLocalStorage<TypesenseCollection | null>(
    VELLUMINE_ACTIVE_COLLECTION_KEY,
    null,
  );

  const setActiveCollection = (collection: TypesenseCollection) => {
    activeCollection.value = collection;
  };

  return {
    activeCollection: readonly(activeCollection),
    setActiveCollection,
  };
});
