// Reference example: https://ui.tailor.tech/patterns/supplier-cascader
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MOCK_GROUPS,
  MOCK_SUPPLIERS,
  MOCK_TOTAL_ACTIVE_COUNT,
  PAGE_SIZE,
  type MockSupplier,
} from "./mockData";

type ActiveGroupId = string | "unaffiliated";

type GroupInfo = {
  id: string;
  name: string;
  supplierIds: string[];
  memberCount: number;
};

type GroupCheckState = "checked" | "unchecked" | "indeterminate";

type SupplierItem = {
  id: string;
  companyName: string;
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

function buildGroupMemberMap(suppliers: MockSupplier[]) {
  const map = new Map<string, string[]>();
  for (const supplier of suppliers) {
    for (const groupId of supplier.groupIds) {
      const list = map.get(groupId) ?? [];
      list.push(supplier.id);
      map.set(groupId, list);
    }
  }
  return map;
}

function filterSuppliers({
  activeGroupId,
  isSearchActive,
  searchText,
  allAffiliatedIds,
  groupMemberMap,
}: {
  activeGroupId: ActiveGroupId | null;
  isSearchActive: boolean;
  searchText: string;
  allAffiliatedIds: Set<string>;
  groupMemberMap: Map<string, string[]>;
}) {
  let items = MOCK_SUPPLIERS;

  if (isSearchActive) {
    const query = searchText.trim().toLowerCase();
    items = items.filter((supplier) =>
      supplier.companyName.toLowerCase().includes(query),
    );
    return items;
  }

  if (activeGroupId === null) return [];

  if (activeGroupId === "unaffiliated") {
    return items.filter((supplier) => !allAffiliatedIds.has(supplier.id));
  }

  const memberIds = new Set(groupMemberMap.get(activeGroupId) ?? []);
  return items.filter((supplier) => memberIds.has(supplier.id));
}

export function useSupplierCascader() {
  const groupMemberMap = useMemo(
    () => buildGroupMemberMap(MOCK_SUPPLIERS),
    [],
  );

  const allAffiliatedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const list of groupMemberMap.values()) {
      for (const id of list) ids.add(id);
    }
    return ids;
  }, [groupMemberMap]);

  const groups: GroupInfo[] = useMemo(
    () =>
      MOCK_GROUPS.map((group) => ({
        id: group.id,
        name: group.name,
        supplierIds: groupMemberMap.get(group.id) ?? [],
        memberCount: group.memberCount,
      })),
    [groupMemberMap],
  );

  const [activeGroupId, setActiveGroupId] = useState<ActiveGroupId | null>(
    null,
  );
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [supplierNameCache, setSupplierNameCache] = useState<
    Map<string, string>
  >(() => new Map());
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebouncedValue(searchText, 300);
  const isSearchActive = debouncedSearchText.trim() !== "";

  const filteredSuppliers = useMemo(
    () =>
      filterSuppliers({
        activeGroupId,
        isSearchActive,
        searchText: debouncedSearchText,
        allAffiliatedIds,
        groupMemberMap,
      }),
    [
      activeGroupId,
      isSearchActive,
      debouncedSearchText,
      allAffiliatedIds,
      groupMemberMap,
    ],
  );

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const shouldFetchSuppliers = activeGroupId !== null || isSearchActive;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearchText, activeGroupId]);

  const suppliers = useMemo(
    () =>
      filteredSuppliers.slice(0, visibleCount).map((supplier) => ({
        id: supplier.id,
        companyName: supplier.companyName,
      })),
    [filteredSuppliers, visibleCount],
  );

  const hasNextPage = visibleCount < filteredSuppliers.length;
  const fetching = false;
  const fetchingMore = false;
  const fetchMoreError = false;

  const fetchNextPage = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  const handleActiveGroupChange = useCallback((id: ActiveGroupId) => {
    setActiveGroupId(id);
    setSearchText("");
  }, []);

  const handleToggle = useCallback(
    (supplierId: string, checked: boolean, supplierName?: string) => {
      setSelectedSupplierIds((prev) => {
        const next = new Set(prev);
        if (checked) next.add(supplierId);
        else next.delete(supplierId);
        return next;
      });

      if (checked && supplierName) {
        setSupplierNameCache((prev) => {
          const next = new Map(prev);
          next.set(supplierId, supplierName);
          return next;
        });
      } else if (!checked) {
        setSupplierNameCache((prev) => {
          const next = new Map(prev);
          next.delete(supplierId);
          return next;
        });
      }
    },
    [],
  );

  const supplierIdToNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const supplier of MOCK_SUPPLIERS) {
      map.set(supplier.id, supplier.companyName);
    }
    return map;
  }, []);

  const handleGroupToggle = useCallback(
    (groupId: string, checked: boolean) => {
      const memberIds = groupMemberMap.get(groupId) ?? [];
      setSelectedSupplierIds((prev) => {
        const next = new Set(prev);
        for (const id of memberIds) {
          if (checked) next.add(id);
          else next.delete(id);
        }
        return next;
      });

      if (checked) {
        setSupplierNameCache((prev) => {
          const next = new Map(prev);
          for (const id of memberIds) {
            const name = supplierIdToNameMap.get(id);
            if (name) next.set(id, name);
          }
          return next;
        });
      } else {
        setSupplierNameCache((prev) => {
          const next = new Map(prev);
          for (const id of memberIds) next.delete(id);
          return next;
        });
      }
    },
    [groupMemberMap, supplierIdToNameMap],
  );

  const getGroupCheckState = useCallback(
    (groupId: string): GroupCheckState => {
      const memberIds = groupMemberMap.get(groupId) ?? [];
      if (memberIds.length === 0) return "unchecked";

      const selectedCount = memberIds.filter((id) =>
        selectedSupplierIds.has(id),
      ).length;
      if (selectedCount === 0) return "unchecked";
      if (selectedCount === memberIds.length) return "checked";
      return "indeterminate";
    },
    [groupMemberMap, selectedSupplierIds],
  );

  const handleClearAll = useCallback(() => {
    setSelectedSupplierIds(new Set());
    setSupplierNameCache(new Map());
  }, []);

  const selectedSuppliers: SupplierItem[] = useMemo(() => {
    const result: SupplierItem[] = [];
    for (const id of selectedSupplierIds) {
      const name =
        supplierNameCache.get(id) ?? supplierIdToNameMap.get(id) ?? null;
      if (name) result.push({ id, companyName: name });
    }
    return result.toSorted((left, right) =>
      left.companyName.localeCompare(right.companyName),
    );
  }, [selectedSupplierIds, supplierNameCache, supplierIdToNameMap]);

  const handleRemoveSupplier = useCallback((supplierId: string) => {
    setSelectedSupplierIds((prev) => {
      const next = new Set(prev);
      next.delete(supplierId);
      return next;
    });
    setSupplierNameCache((prev) => {
      const next = new Map(prev);
      next.delete(supplierId);
      return next;
    });
  }, []);

  const prevDepsRef = useRef({ search: debouncedSearchText, activeGroupId });
  useEffect(() => {
    const prev = prevDepsRef.current;
    if (
      prev.search !== debouncedSearchText ||
      prev.activeGroupId !== activeGroupId
    ) {
      prevDepsRef.current = { search: debouncedSearchText, activeGroupId };
    }
  }, [debouncedSearchText, activeGroupId]);

  return {
    groups,
    activeGroupId,
    setActiveGroupId: handleActiveGroupChange,
    totalActiveCount: MOCK_TOTAL_ACTIVE_COUNT,
    suppliers,
    fetching: shouldFetchSuppliers ? fetching : false,
    hasNextPage,
    fetchingMore,
    fetchMoreError,
    fetchNextPage,
    selectedSupplierIds,
    selectedSuppliers,
    handleToggle,
    handleGroupToggle,
    getGroupCheckState,
    handleClearAll,
    handleRemoveSupplier,
    totalSelectedCount: selectedSupplierIds.size,
    searchText,
    setSearchText,
    isSearchActive,
    loading: false,
  };
}
