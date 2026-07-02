import { useTranslation } from "react-i18next";
import { typeColor } from "../api/typeColors";

export function TypeBadge({ name }: { name: string }) {
  const { t } = useTranslation();
  return (
    <span className="type-badge" style={{ backgroundColor: typeColor(name) }}>
      {t(`types.${name}`, { defaultValue: name })}
    </span>
  );
}
