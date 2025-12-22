// src/types/holidayMenu.ts

export interface HolidayMenu {
  id: number | string;
  holidayName: string;
  holidayDate: string;
  recipeIds: (number | string)[];
  dateAdded?: string;
}