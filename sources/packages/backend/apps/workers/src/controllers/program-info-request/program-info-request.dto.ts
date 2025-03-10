import {
  APPLICATION_ID,
  PROGRAM_INFO_STATUS,
  STUDENT_DATA_SELECTED_LOCATION,
  STUDENT_DATA_SELECTED_PROGRAM,
} from "@sims/services/workflow/variables/assessment-gateway";
import { ProgramInfoStatus } from "@sims/sims-db";

export interface ProgramInfoRequestJobInDTO {
  [APPLICATION_ID]: number;
  [STUDENT_DATA_SELECTED_LOCATION]: number;
  [STUDENT_DATA_SELECTED_PROGRAM]?: number;
}

export interface ProgramInfoRequestJobHeaderDTO {
  programInfoStatus: ProgramInfoStatus;
}

export interface ProgramInfoRequestJobOutDTO {
  [PROGRAM_INFO_STATUS]: ProgramInfoStatus;
}
