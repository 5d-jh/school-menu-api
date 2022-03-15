import { AllergyDisplayType } from './AllergyDisplayType'

export type QueryStringOptions = {
    year?: number;
    month?: number;
    date?: number;
    allergy?: AllergyDisplayType;
}
