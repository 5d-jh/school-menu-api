export type SchoolMenuTable = {
    date: String,
    breakfast: string[],
    lunch: string[],
    dinner: string[]
};

export type QueryStringOptions = {
    hideAllergy?: "true"|"false",
    date?: string
}

export enum SchoolType {
    "elementary",
    "middle",
    "high"
};