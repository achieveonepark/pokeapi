import { useTranslation } from "react-i18next";
import { localizedName } from "../api/textUtils";
import { usePokemonSpecies } from "../hooks/usePokemon";
import type { OwnedPokemon } from "../team/types";

function SwapCandidate({ member, onPick }: { member: OwnedPokemon; onPick: () => void }) {
  const { t, i18n } = useTranslation();
  const { data: species } = usePokemonSpecies(member.slug);
  const displayName = species
    ? localizedName(species.names, i18n.resolvedLanguage ?? "en", member.slug)
    : member.slug;

  return (
    <button type="button" className="swap-candidate" onClick={onPick}>
      {t("battle.level", { level: member.level })} {displayName}
    </button>
  );
}

export function CapturePrompt({
  wildDisplayName,
  team,
  isFull,
  onDecide,
}: {
  wildDisplayName: string;
  team: OwnedPokemon[];
  isFull: boolean;
  onDecide: (accept: boolean, replaceIndex?: number) => void;
}) {
  const { t } = useTranslation();

  if (!isFull) {
    return (
      <div className="capture-prompt">
        <p>{t("battle.capturePrompt", { name: wildDisplayName })}</p>
        <div className="capture-actions">
          <button type="button" className="battle-start-button" onClick={() => onDecide(true)}>
            {t("battle.captureYes")}
          </button>
          <button type="button" className="capture-decline" onClick={() => onDecide(false)}>
            {t("battle.captureNo")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="capture-prompt">
      <p>{t("battle.teamFullPrompt", { name: wildDisplayName })}</p>
      <div className="swap-candidates">
        {team.map((member, i) => (
          <SwapCandidate key={`${member.slug}-${i}`} member={member} onPick={() => onDecide(true, i)} />
        ))}
      </div>
      <button type="button" className="capture-decline" onClick={() => onDecide(false)}>
        {t("battle.captureNo")}
      </button>
    </div>
  );
}
