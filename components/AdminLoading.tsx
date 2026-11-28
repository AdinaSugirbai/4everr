"use client";

import { FiLoader } from "react-icons/fi";
import { useI18n } from "@/lib/i18n";

export default function AdminLoading() {
  const { t } = useI18n();
  return (
    <div role="status" aria-live="polite" className="flex min-h-32 items-center justify-center gap-3 text-sm text-mute">
      <FiLoader className="animate-spin text-brand" aria-hidden="true" />
      <span>{t("Жүктеліп жатыр...|Загружается...|Loading...")}</span>
    </div>
  );
}
