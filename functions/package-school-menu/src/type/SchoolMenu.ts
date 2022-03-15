export type SchoolMenu = {
    date: string,
    breakfast: Array<string>,
    lunch: Array<string>,
    dinner: Array<string>
};

export type SchoolMenuAllergyFormed = {
    date: string,
    breakfast: Array<{ name: string, allergy: number[] }>,
    lunch: Array<{ name: string, allergy: number[] }>,
    dinner: Array<{ name: string, allergy: number[] }>
}
