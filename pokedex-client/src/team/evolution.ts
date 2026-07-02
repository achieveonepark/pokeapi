import type { ChainLink, EvolutionChain } from "../api/types";

function findNode(link: ChainLink, speciesName: string): ChainLink | null {
  if (link.species.name === speciesName) return link;
  for (const child of link.evolves_to) {
    const found = findNode(child, speciesName);
    if (found) return found;
  }
  return null;
}

/**
 * Only plain level-up evolutions are handled (no items/trade/friendship/etc.) —
 * this is a lightweight battle mini-game, not a full evolution-condition engine.
 */
export function findLevelEvolution(chain: EvolutionChain, speciesName: string, atLevel: number): string | null {
  const node = findNode(chain.chain, speciesName);
  if (!node) return null;
  for (const next of node.evolves_to) {
    const eligible = next.evolution_details.some(
      (d) => d.trigger?.name === "level-up" && d.min_level != null && d.min_level <= atLevel,
    );
    if (eligible) return next.species.name;
  }
  return null;
}
