import { useTranslation } from "react-i18next";
import { localizedName } from "../api/textUtils";
import { useAbilityDetail } from "../hooks/usePokemon";

export function AbilityName({ name }: { name: string }) {
  const { i18n } = useTranslation();
  const { data } = useAbilityDetail(name);
  const fallback = name.replace(/-/g, " ");
  return <>{data ? localizedName(data.names, i18n.resolvedLanguage ?? "en", fallback) : fallback}</>;
}
