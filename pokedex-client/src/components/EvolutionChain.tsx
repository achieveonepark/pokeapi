import { Link } from "react-router-dom";
import { idFromUrl, officialArtworkUrl } from "../api/client";
import { describeEvolution } from "../api/evolutionText";
import type { ChainLink } from "../api/types";

function flatten(link: ChainLink): { species: ChainLink["species"]; via: string | null }[][] {
  const stages: { species: ChainLink["species"]; via: string | null }[][] = [
    [{ species: link.species, via: null }],
  ];
  let current = link.evolves_to;
  while (current.length > 0) {
    stages.push(
      current.map((c) => ({
        species: c.species,
        via: c.evolution_details[0] ? describeEvolution(c.evolution_details[0]) : null,
      })),
    );
    current = current.flatMap((c) => c.evolves_to);
  }
  return stages;
}

export function EvolutionChain({ chain }: { chain: ChainLink }) {
  const stages = flatten(chain);

  return (
    <div className="evolution-chain">
      {stages.map((stage, i) => (
        <div className="evolution-stage-group" key={i}>
          {i > 0 && <span className="evolution-arrow">→</span>}
          <div className="evolution-stage">
            {stage.map(({ species, via }) => {
              const id = idFromUrl(species.url);
              return (
                <div key={species.name} className="evolution-node">
                  {via && <span className="evolution-condition">{via}</span>}
                  <Link to={`/pokemon/${species.name}`} className="evolution-link">
                    <img src={officialArtworkUrl(id)} alt={species.name} loading="lazy" />
                    <span>{species.name.replace(/-/g, " ")}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
