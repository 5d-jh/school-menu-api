import { AllergyDisplayType } from "./AllergyDisplayType";

export type QueryStringOptions = {
    year?: string;
    month?: string;
    date?: string;
    allergy?: AllergyDisplayType;
}