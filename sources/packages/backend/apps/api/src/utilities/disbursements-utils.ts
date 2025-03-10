import { Award } from "../esdc-integration/e-cert-integration/models/e-cert-integration-model";
import { DisbursementValueType } from "@sims/sims-db";

/**
 * Extract from the list of awards (disbursement values)
 * the specific types.
 * @param awards list of awards (disbursement values).
 * @param types types to be extracted.
 * @returns list of awards of the specified types.
 */
export function getDisbursementValuesByType(
  awards: Award[],
  types: DisbursementValueType[],
): Award[] {
  return awards.filter((award) => types.includes(award.valueType));
}

/**
 * Extract from the award amount
 * the specific types.
 * @param awards list of awards (disbursement values).
 * @param valueCode valueCode to be extracted.
 * @returns award amount of the specified types.
 */
export function getDisbursementAmountByValueCode(
  awards: Award[],
  valueCode: string,
): number {
  return +awards.find((award) => award.valueCode.includes(valueCode))
    .valueAmount;
}

/**
 * Get the sum of the awards (disbursement values)
 * for the specific types.
 * @param awards list of awards (disbursement values).
 * @param types types sum and get the total.
 * @returns sum of the awards (disbursement values)
 * for the specific types.
 */
export function getTotalDisbursementAmount(
  awards: Award[],
  types: DisbursementValueType[],
): number {
  return getDisbursementValuesByType(awards, types).reduce(
    (totalAmount, award) => totalAmount + +award.valueAmount,
    0,
  );
}

/**
 * Ensures that a number is rounded up to the decimal places
 * and have the decimal part combined into the integer part.
 * For instance:
 * - 12345.78999 = 1234579 (79 is the decimal part).
 * - 123.999 = 12400 (00 is the decimal part).
 * - 123.9 = 12390 (90 is the decimal part).
 * - 123 = 12300 (00 is the decimal part).
 * @param decimalNumber decimal number to be rounded.
 * @param decimalPlaces number of decimal places to be considered
 * for rounding.
 * @returns decimal number converted to a integer where the decimals
 * part are rounded and combined into the integer part.
 */
export function combineDecimalPlaces(
  decimalNumber: number,
  decimalPlaces = 2,
): number {
  const multiplier = Math.pow(10, decimalPlaces);
  // Round the number up to the number of decimal places.
  const roundedValue = Math.round(decimalNumber * multiplier) / multiplier;
  // Combine the decimals into the integer part before returning.
  return roundedValue * multiplier;
}

/**
 * Round a number to the nearest decimal number with
 * the specific decimal places.
 * @param decimalValue decimal value to be rounded.
 * @param decimalPlaces number of decimal places to be considered
 * for rounding.
 * @returns if a valid number, returns the rounded number, otherwise null.
 */
export function decimalRound(decimalValue: number, decimalPlaces = 2): number {
  const multiplier = Math.pow(10, decimalPlaces);
  return Math.round(decimalValue * multiplier) / multiplier;
}
