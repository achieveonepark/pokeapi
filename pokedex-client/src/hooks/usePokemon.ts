import { useQuery } from "@tanstack/react-query";
import {
  getAllPokemonIndex,
  getAllTypes,
  getEvolutionChain,
  getPokemonByName,
  getPokemonSpecies,
  getTypeDetail,
} from "../api/client";

export function usePokemonIndex() {
  return useQuery({
    queryKey: ["pokemon-index"],
    queryFn: getAllPokemonIndex,
    staleTime: Infinity,
  });
}

export function useTypeList() {
  return useQuery({
    queryKey: ["type-list"],
    queryFn: getAllTypes,
    staleTime: Infinity,
  });
}

export function useTypeDetail(name: string | null) {
  return useQuery({
    queryKey: ["type-detail", name],
    queryFn: () => getTypeDetail(name as string),
    enabled: !!name,
    staleTime: Infinity,
  });
}

export function usePokemonDetail(nameOrId: string | number | null) {
  return useQuery({
    queryKey: ["pokemon", nameOrId],
    queryFn: () => getPokemonByName(nameOrId as string | number),
    enabled: nameOrId !== null && nameOrId !== undefined,
    staleTime: Infinity,
  });
}

export function usePokemonSpecies(nameOrId: string | number | null) {
  return useQuery({
    queryKey: ["species", nameOrId],
    queryFn: () => getPokemonSpecies(nameOrId as string | number),
    enabled: nameOrId !== null && nameOrId !== undefined,
    staleTime: Infinity,
  });
}

export function useEvolutionChain(url: string | null) {
  return useQuery({
    queryKey: ["evolution-chain", url],
    queryFn: () => getEvolutionChain(url as string),
    enabled: !!url,
    staleTime: Infinity,
  });
}
