import {
  Controller,
  Param,
  Get,
  NotFoundException,
  Patch,
  Body,
  UnprocessableEntityException,
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ASSESSMENT_ALREADY_IN_PROGRESS,
  StudentAppealService,
  StudentAssessmentService,
} from "../../services";
import { AuthorizedParties } from "../../auth/authorized-parties.enum";
import {
  AllowAuthorizedParty,
  Groups,
  Roles,
  UserToken,
} from "../../auth/decorators";
import {
  ApiNotFoundResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import BaseController from "../BaseController";
import { ApiProcessError, ClientTypeBaseRoute } from "../../types";
import { UserGroups } from "../../auth/user-groups.enum";
import {
  StudentAppealAPIOutDTO,
  StudentAppealApprovalAPIInDTO,
  StudentAppealPendingSummaryAPIOutDTO,
} from "./models/student-appeal.dto";
import { getUserFullName } from "../../utilities";
import { CustomNamedError } from "@sims/utilities";
import { IUserToken } from "../../auth/userToken.interface";
import {
  STUDENT_APPEAL_INVALID_OPERATION,
  STUDENT_APPEAL_NOT_FOUND,
} from "../../services/student-appeal/constants";
import { StudentAppealStatus } from "@sims/sims-db";
import {
  PaginatedResultsAPIOutDTO,
  StudentAppealPendingPaginationOptionsAPIInDTO,
} from "../models/pagination.dto";
import { Role } from "../../auth/roles.enum";

@AllowAuthorizedParty(AuthorizedParties.aest)
@Groups(UserGroups.AESTUser)
@Controller("appeal")
@ApiTags(`${ClientTypeBaseRoute.AEST}-appeal`)
export class StudentAppealAESTController extends BaseController {
  constructor(
    private readonly studentAppealService: StudentAppealService,
    private readonly studentAssessmentService: StudentAssessmentService,
  ) {
    super();
  }

  /**
   * Get the student appeal and its requests.
   * @param appealId appeal id to be retrieved.
   * @returns the student appeal and its requests.
   */
  @Get(":appealId/requests")
  @ApiNotFoundResponse({
    description: "Not able to find the student appeal.",
  })
  async getStudentAppealWithRequests(
    @Param("appealId", ParseIntPipe) appealId: number,
  ): Promise<StudentAppealAPIOutDTO> {
    const studentAppeal =
      await this.studentAppealService.getAppealAndRequestsById(appealId);
    if (!studentAppeal) {
      throw new NotFoundException("Not able to find the student appeal.");
    }

    return {
      id: studentAppeal.id,
      submittedDate: studentAppeal.submittedDate,
      status: studentAppeal.status,
      appealRequests: studentAppeal.appealRequests.map((appealRequest) => ({
        id: appealRequest.id,
        appealStatus: appealRequest.appealStatus,
        submittedData: appealRequest.submittedData,
        submittedFormName: appealRequest.submittedFormName,
        assessedDate: appealRequest.assessedDate,
        noteDescription: appealRequest.note?.description,
        assessedByUserName: getUserFullName(appealRequest.assessedBy),
      })),
    };
  }

  /**
   * Update all student appeals requests at once.
   * All the appeals requests must be present with the respective
   * approved or declined status.
   * @param appealId appeal id to be approved/declined.
   * @param payload appeal requests to be approved/declined.
   * @param userToken user authentication token.
   */
  @Roles(Role.StudentApproveDeclineAppeals)
  @Patch(":appealId/requests")
  @ApiNotFoundResponse({
    description: `Not able to find the appeal or the appeal has requests different from '${StudentAppealStatus.Pending}'.`,
  })
  @ApiUnprocessableEntityResponse({
    description:
      `It is not possible to process the appeal approval because one of the following conditions: ` +
      `the appeal is not in the '${StudentAppealStatus.Pending}' status; ` +
      `the appeal is already associated with an assessment workflow; ` +
      `some appeal request is already in a state different than '${StudentAppealStatus.Pending}'.`,
  })
  async approveStudentAppealRequests(
    @Param("appealId", ParseIntPipe) appealId: number,
    @Body() payload: StudentAppealApprovalAPIInDTO,
    @UserToken() userToken: IUserToken,
  ): Promise<void> {
    try {
      const savedAppeal = await this.studentAppealService.approveRequests(
        appealId,
        payload.requests,
        userToken.userId,
      );

      // The appeal approval will create a student assessment to be processed only
      // if at least one request was approved, hence sometimes an appeal will not result
      // is an assessment creation if all requests are declined.
      if (savedAppeal.studentAssessment) {
        await this.studentAssessmentService.startAssessment(
          savedAppeal.studentAssessment.id,
        );
      }
    } catch (error: unknown) {
      if (error instanceof CustomNamedError) {
        switch (error.name) {
          case STUDENT_APPEAL_NOT_FOUND:
            throw new NotFoundException(error.message);
          case STUDENT_APPEAL_INVALID_OPERATION:
            throw new UnprocessableEntityException(error.message);
          case ASSESSMENT_ALREADY_IN_PROGRESS:
            throw new UnprocessableEntityException(
              new ApiProcessError(error.message, error.name),
            );
        }
      }
      throw error;
    }
  }

  /**
   * Gets all pending student application appeals.
   * @param pagination options to execute the pagination.
   * @returns list of pending student application appeals.
   */
  @Get("pending")
  async getAppeals(
    @Query() pagination: StudentAppealPendingPaginationOptionsAPIInDTO,
  ): Promise<PaginatedResultsAPIOutDTO<StudentAppealPendingSummaryAPIOutDTO>> {
    const studentAppeals = await this.studentAppealService.getAppealsByStatus(
      pagination,
      StudentAppealStatus.Pending,
    );

    return {
      results: studentAppeals.results.map((eachAppeal) => ({
        appealId: eachAppeal.id,
        applicationId: eachAppeal.application.id,
        studentId: eachAppeal.application.student.id,
        applicationNumber: eachAppeal.application.applicationNumber,
        submittedDate: eachAppeal.submittedDate,
        fullName: getUserFullName(eachAppeal.application.student.user),
      })),
      count: studentAppeals.count,
    };
  }
}
