// Re-export from canonical sources to maintain backward compatibility.
// Types come from @/types/law, data and helpers from @/lib/utils/law-constants.
export type { Law as LawInfo, LawCategory } from "@/types/law";
export { IT_LAWS, getLawById, getLawsByCategory, CATEGORIES } from "@/lib/utils/law-constants";
