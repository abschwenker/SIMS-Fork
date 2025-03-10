import {
  DesignationAgreementStatus,
  InstitutionLocationData,
} from "@sims/sims-db";
import { IsBoolean, Min } from "class-validator";

/**
 * This DTO contains dynamic data that must
 * be validated by the form.io dryrun validation.
 */
export interface SubmitDesignationAgreementDto {
  dynamicData: any;
  locations: SubmittedLocationsDto[];
}

/**
 * This DTO contains dynamic data that must
 * be validated by the form.io dryrun validation.
 */
export interface SubmittedLocationsDto {
  locationId: number;
  requestForDesignation: boolean;
}

export interface GetDesignationAgreementDto {
  designationId: number;
  designationStatus: DesignationAgreementStatus;
  locationsDesignations: LocationsDesignationsDto[];
  submittedData: any;
  startDate: string;
  endDate: string;
  institutionId: number;
  institutionName: string;
  institutionType: string;
  isBCPrivate: boolean;
}

export interface LocationsDesignationsDto {
  designationLocationId?: number;
  locationId: number;
  locationName: string;
  locationData: InstitutionLocationData;
  requested: boolean;
  approved?: boolean;
}

export interface GetDesignationAgreementsDto {
  designationId: number;
  designationStatus: DesignationAgreementStatus;
  submittedDate: Date;
  startDate?: string;
  endDate?: string;
}

export interface PendingDesignationDto extends GetDesignationAgreementsDto {
  legalOperatingName: string;
}

export class UpdateDesignationLocation {
  @Min(1)
  locationId: number;
  @IsBoolean()
  approved: boolean;
}
/**
 * startDate, endDate and locationsDesignations used only for approval.
 */
export interface UpdateDesignation {
  designationStatus: DesignationAgreementStatus;
  startDate?: string;
  endDate?: string;
  locationsDesignations?: UpdateDesignationLocation[];
  note: string;
}
