"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

export type SortOption = { value: string; label: string };
type Props = {
  search: string;
  onSearch: (value: string) => void;
  placeholder: string;
  sort?: string;
  onSort?: (value: string) => void;
  sortOptions?: SortOption[];
  filters?: ReactNode;
};

export default function AdminListToolbar({ search, onSearch, placeholder, sort, onSort, sortOptions, filters }: Props) {
  const { t } = useI18n();
  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
      <input className="inp min-w-0" value={search} onChange={(e) => onSearch(e.target.value)} placeholder={t(placeholder)} aria-label={t("Іздеу|Поиск|Search")} />
      {filters}
      {sortOptions && onSort && sort && <select className="inp min-w-0" value={sort} onChange={(e) => onSort(e.target.value)} aria-label={t("Сұрыптау|Сортировка|Sort")}>{sortOptions.map((option) => <option key={option.value} value={option.value}>{t(option.label)}</option>)}</select>}
    </div>
  );
}
