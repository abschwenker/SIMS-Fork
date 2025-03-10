import { Controller } from "@nestjs/common";
import { ZeebeWorker } from "../../zeebe";
import {
  ZeebeJob,
  MustReturnJobActionAcknowledgement,
  IOutputVariables,
  ICustomHeaders,
} from "zeebe-node";
import { CRAIncomeVerificationService } from "../../services";
import {
  CheckIncomeRequestJobInDTO,
  CheckIncomeRequestJobOutDTO,
  CreateIncomeRequestJobInDTO,
  CreateIncomeRequestJobOutDTO,
} from "..";
import { APPLICATION_ID } from "@sims/services/workflow/variables/assessment-gateway";
import {
  INCOME_VERIFICATION_ID,
  REPORTED_INCOME,
  SUPPORTING_USER_ID,
  TAX_YEAR,
} from "@sims/services/workflow/variables/cra-integration-income-verification";
import { MaxJobsToActivate } from "../../types";

@Controller()
export class CRAIntegrationController {
  constructor(
    private readonly incomeVerificationService: CRAIncomeVerificationService,
  ) {}

  /**
   * Create the record to be sent to CRA for income verification.
   * @returns created income verification id.
   */
  @ZeebeWorker("create-income-request", {
    fetchVariable: [
      APPLICATION_ID,
      SUPPORTING_USER_ID,
      TAX_YEAR,
      REPORTED_INCOME,
    ],
    maxJobsToActivate: MaxJobsToActivate.Normal,
  })
  async createIncomeRequest(
    job: Readonly<
      ZeebeJob<
        CreateIncomeRequestJobInDTO,
        IOutputVariables,
        CreateIncomeRequestJobOutDTO
      >
    >,
  ): Promise<MustReturnJobActionAcknowledgement> {
    const incomeRequest =
      await this.incomeVerificationService.createIncomeVerification(
        job.variables.applicationId,
        job.variables.taxYear,
        job.variables.reportedIncome,
        job.variables.supportingUserId,
      );
    const [identifier] = incomeRequest.identifiers;

    await this.incomeVerificationService.checkForCRAIncomeVerificationBypass(
      identifier.id,
    );

    return job.complete({ incomeVerificationId: identifier.id });
  }

  /**
   * Checks if the income verification was completed.
   * @returns true if income verification was completed,
   * otherwise, false.
   */
  @ZeebeWorker("check-income-request", {
    fetchVariable: [INCOME_VERIFICATION_ID],
    maxJobsToActivate: MaxJobsToActivate.Maximum,
  })
  async checkIncomeRequest(
    job: Readonly<
      ZeebeJob<
        CheckIncomeRequestJobInDTO,
        ICustomHeaders,
        CheckIncomeRequestJobOutDTO
      >
    >,
  ): Promise<MustReturnJobActionAcknowledgement> {
    const incomeVerificationCompleted =
      await this.incomeVerificationService.isIncomeVerificationCompleted(
        job.variables.incomeVerificationId,
      );
    return job.complete({ incomeVerificationCompleted });
  }
}
