import { DisbursementValueType } from "@sims/sims-db";

export interface DisbursementValue {
  valueCode: string;
  valueType: DisbursementValueType;
  valueAmount: number;
}

export interface DisbursementSchedule {
  disbursementDate: string;
  negotiatedExpiryDate: string;
  disbursements: DisbursementValue[];
}

export interface SaveDisbursementSchedulesJobInDTO {
  assessmentId: number;
  disbursementSchedules: DisbursementSchedule[];
}
