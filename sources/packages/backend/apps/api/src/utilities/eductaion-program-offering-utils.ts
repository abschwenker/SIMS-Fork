import { EducationProgramOffering } from "@sims/sims-db";
import { getDateOnlyFormat } from "@sims/utilities";

/**
 * Utility to get year of study label.
 * @param yearId
 * @returns Year of Study label
 */
export const getYearOfStudyLabel = (yearId: number): string => {
  return `Year ${yearId}`;
};

/**
 * Gets Offering name with study start and end date.
 * @param offering offering object.
 * @returns offering name with study start and end date.
 */
export function getOfferingNameAndPeriod(
  offering: Partial<EducationProgramOffering>,
): string {
  return `${offering.name} (${getDateOnlyFormat(
    offering.studyStartDate,
  )} - ${getDateOnlyFormat(offering.studyEndDate)})${
    offering.showYearOfStudy
      ? " - " + getYearOfStudyLabel(offering.yearOfStudy)
      : ""
  }`;
}
