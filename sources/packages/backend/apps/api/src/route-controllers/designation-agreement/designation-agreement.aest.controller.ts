import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Patch,
  Body,
  Query,
  UnprocessableEntityException,
  ParseIntPipe,
  ParseEnumPipe,
} from "@nestjs/common";
import {
  DesignationAgreementService,
  FormService,
  InstitutionLocationService,
} from "../../services";
import { DesignationAgreementStatus } from "@sims/sims-db";
import { PaginationParams } from "../../utilities";
import { getISODateOnlyString } from "@sims/utilities";
import { AuthorizedParties } from "../../auth/authorized-parties.enum";
import {
  AllowAuthorizedParty,
  Groups,
  Roles,
  UserToken,
} from "../../auth/decorators";
import { IUserToken } from "../../auth/userToken.interface";
import { UserGroups } from "../../auth/user-groups.enum";
import {
  GetDesignationAgreementDto,
  GetDesignationAgreementsDto,
  PendingDesignationDto,
} from "./models/designation-agreement.model";
import { UpdateDesignationAPIInDto } from "./models/designation-agreement.dto";
import { DesignationAgreementControllerService } from "./designation-agreement.controller.service";
import { ApiTags } from "@nestjs/swagger";
import BaseController from "../BaseController";
import { Role } from "../../auth/roles.enum";

@AllowAuthorizedParty(AuthorizedParties.aest)
@Groups(UserGroups.AESTUser)
@Controller("designation-agreement")
@ApiTags("designation-agreement")
export class DesignationAgreementAESTController extends BaseController {
  constructor(
    private readonly designationAgreementControllerService: DesignationAgreementControllerService,
    private readonly designationAgreementService: DesignationAgreementService,
    private readonly formService: FormService,
    private readonly institutionLocationService: InstitutionLocationService,
  ) {
    super();
  }

  /**
   * Retrieve the designation agreement information and
   * the associated locations approvals.
   * @param designationId
   * @returns designation agreement information.
   */
  @Get(":designationId")
  async getDesignationAgreement(
    @Param("designationId", ParseIntPipe) designationId: number,
  ): Promise<GetDesignationAgreementDto> {
    return this.designationAgreementControllerService.getDesignationAgreement(
      designationId,
    );
  }

  /**
   * Get the list of all the designations that belongs to
   * the institution.
   * @param institutionId
   * @returns the list of all the designations that
   * belongs to the institution.
   */
  @Get("institution/:institutionId")
  async getDesignationAgreements(
    @Param("institutionId", ParseIntPipe) institutionId: number,
  ): Promise<GetDesignationAgreementsDto[]> {
    return this.designationAgreementControllerService.getDesignationAgreements(
      institutionId,
    );
  }

  /**
   * API to retrieve all designations by status.
   * @param designationStatus
   * @param searchCriteria to search designation.
   * @returns Pending designations.
   */
  @Get("status/:designationStatus")
  async getDesignationAgreementByStatus(
    @Param("designationStatus", new ParseEnumPipe(DesignationAgreementStatus))
    designationStatus: DesignationAgreementStatus,
    @Query(PaginationParams.SearchCriteria) searchCriteria: string,
  ): Promise<PendingDesignationDto[]> {
    const pendingDesignations =
      await this.designationAgreementService.getDesignationAgreementsByStatus(
        designationStatus,
        searchCriteria,
      );
    return pendingDesignations.map(
      (pendingDesignation) =>
        ({
          designationId: pendingDesignation.id,
          designationStatus: pendingDesignation.designationStatus,
          submittedDate: pendingDesignation.submittedDate,
          startDate: getISODateOnlyString(pendingDesignation.startDate),
          endDate: getISODateOnlyString(pendingDesignation.endDate),
          legalOperatingName: pendingDesignation.institution.legalOperatingName,
        } as PendingDesignationDto),
    );
  }

  /**
   * Update designation for Approval/Denial or re-approve by ministry(AEST).
   * @param designationId
   * @param payload Designation which is going to be updated.
   * @param userToken
   */
  @Roles(Role.InstitutionApproveDeclineDesignation)
  @Patch(":designationId")
  async updateDesignationAgreement(
    @Param("designationId", ParseIntPipe) designationId: number,
    @Body() payload: UpdateDesignationAPIInDto,
    @UserToken() userToken: IUserToken,
  ): Promise<void> {
    const designation =
      await this.designationAgreementService.getDesignationForUpdate(
        designationId,
      );
    if (!designation) {
      throw new NotFoundException(
        "Designation agreement not found or it has been declined already.",
      );
    }
    if (payload.designationStatus === DesignationAgreementStatus.Approved) {
      const locationIds = payload.locationsDesignations.map(
        (location) => location.locationId,
      );
      const validInstitutionLocations =
        this.institutionLocationService.validateInstitutionLocations(
          designation.institution.id,
          locationIds,
        );
      if (!validInstitutionLocations) {
        throw new UnprocessableEntityException(
          "One or more locations provided does not belong to designation institution.",
        );
      }
    }
    await this.designationAgreementService.updateDesignation(
      designationId,
      designation.institution.id,
      userToken.userId,
      payload,
      designation.designationAgreementLocations,
    );
  }
}
