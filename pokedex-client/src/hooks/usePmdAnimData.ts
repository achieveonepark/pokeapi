import { useQuery } from "@tanstack/react-query";
import { fetchPmdAnimData } from "../pmd/api";

/** Not every species/form has community sprite coverage yet, so a 404 here is an expected, non-retried outcome. */
export function usePmdAnimData(dexId: number | null) {
  return useQuery({
    queryKey: ["pmd-animdata", dexId],
    queryFn: () => fetchPmdAnimData(dexId as number),
    enabled: dexId !== null,
    staleTime: Infinity,
    retry: false,
  });
}
