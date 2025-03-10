import HttpBaseClient from "./common/HttpBaseClient";
import { OfferingIntensity, PaginationOptions } from "@/types";
import { getPaginationQueryString } from "@/helpers";
import {
  OfferingAssessmentAPIInDTO,
  OfferingChangeRequestAPIOutDTO,
  PrecedingOfferingSummaryAPIOutDTO,
  OfferingChangeAssessmentAPIInDTO,
  EducationProgramOfferingAPIInDTO,
  EducationProgramOfferingSummaryAPIOutDTO,
  PaginatedResultsAPIOutDTO,
  OfferingStartDateAPIOutDTO,
  OptionItemAPIOutDTO,
  EducationProgramOfferingAPIOutDTO,
  OfferingValidationResultAPIOutDTO,
  EducationProgramOfferingBasicDataAPIInDTO,
} from "@/services/http/dto";
import { AxiosRequestConfig } from "axios";
import ApiClient from "./ApiClient";
import { FileUploadProgressEventArgs } from "@/services/http/common/FileUploadProgressEvent";

export class EducationProgramOfferingApi extends HttpBaseClient {
  /**
   * Validates an offering payload providing the validation result and
   * study break calculations also used to perform the validation process.
   * @param locationId location id.
   * @param programId program id.
   * @param payload offering data to be validated.
   * @returns offering validation result.
   */
  async validateOffering(
    locationId: number,
    programId: number,
    payload: EducationProgramOfferingAPIInDTO,
  ): Promise<OfferingValidationResultAPIOutDTO> {
    const url = `education-program-offering/location/${locationId}/education-program/${programId}/validation`;
    const offeringValidation = await this.postCallFullResponse<
      EducationProgramOfferingAPIInDTO,
      OfferingValidationResultAPIOutDTO
    >(this.addClientRoot(url), payload);
    return {
      ...offeringValidation.data,
      validationDate: new Date(offeringValidation.headers["last-modified"]),
    };
  }

  /**
   * Creates offering.
   * @param locationId offering location.
   * @param programId offering program.
   * @param payload offering data.
   */
  async createOffering(
    locationId: number,
    programId: number,
    payload: EducationProgramOfferingAPIInDTO,
  ): Promise<void> {
    try {
      const url = `education-program-offering/location/${locationId}/education-program/${programId}`;
      await this.postCall<EducationProgramOfferingAPIInDTO>(
        this.addClientRoot(url),
        payload,
      );
    } catch (error: unknown) {
      this.handleAPICustomError(error);
    }
  }

  /**
   * Get summary of offerings for a program and location.
   * Pagination, sort and search are available on results.
   * @param locationId offering location.
   * @param programId offering program.
   * @param paginationOptions pagination options.
   * @returns offering summary results.
   */
  async getOfferingsSummary(
    locationId: number,
    programId: number,
    paginationOptions: PaginationOptions,
  ): Promise<
    PaginatedResultsAPIOutDTO<EducationProgramOfferingSummaryAPIOutDTO>
  > {
    const url = `education-program-offering/location/${locationId}/education-program/${programId}?${getPaginationQueryString(
      paginationOptions,
    )}`;
    return this.getCallTyped(this.addClientRoot(url));
  }

  /**
   * Get offering details.
   * @param locationId offering location.
   * @param programId offering program.
   * @param offeringId offering.
   * @returns offering details.
   */
  async getOfferingDetailsByLocationAndProgram(
    locationId: number,
    programId: number,
    offeringId: number,
  ): Promise<EducationProgramOfferingAPIOutDTO> {
    const url = `education-program-offering/location/${locationId}/education-program/${programId}/offering/${offeringId}`;
    return this.getCallTyped<EducationProgramOfferingAPIOutDTO>(
      this.addClientRoot(url),
    );
  }

  /**
   * Get offering details.
   * @param offeringId offering.
   * @returns offering details.
   */
  async getOfferingDetails(
    offeringId: number,
  ): Promise<EducationProgramOfferingAPIOutDTO> {
    const url = `education-program-offering/${offeringId}`;
    return this.getCallTyped<EducationProgramOfferingAPIOutDTO>(
      this.addClientRoot(url),
    );
  }

  /**
   * Update offering.
   ** An offering which has at least one student aid application submitted
   ** cannot be modified further except the offering name. In such cases
   ** the offering must be requested for change.
   * @param locationId offering location.
   * @param programId offering program.
   * @param offeringId offering to be modified.
   * @param payload offering data to be updated.
   */
  async updateProgramOffering(
    locationId: number,
    programId: number,
    offeringId: number,
    payload: EducationProgramOfferingAPIInDTO,
  ): Promise<void> {
    try {
      const url = `education-program-offering/location/${locationId}/education-program/${programId}/offering/${offeringId}`;
      await this.patchCall<EducationProgramOfferingAPIInDTO>(
        this.addClientRoot(url),
        payload,
      );
    } catch (error: unknown) {
      this.handleAPICustomError(error);
    }
  }

  /**
   * Updates offering basic information that can be freely changed
   * without affecting the assessment.
   * @param locationId offering location.
   * @param programId offering program.
   * @param offeringId offering to be modified.
   * @param payload offering data to be updated.
   */
  async updateProgramOfferingBasicInformation(
    locationId: number,
    programId: number,
    offeringId: number,
    payload: EducationProgramOfferingBasicDataAPIInDTO,
  ): Promise<void> {
    try {
      const url = `education-program-offering/location/${locationId}/education-program/${programId}/offering/${offeringId}/basic`;
      await this.patchCall(this.addClientRoot(url), payload);
    } catch (error: unknown) {
      this.handleAPICustomError(error);
    }
  }

  /**
   * Get offerings for the given program and location
   * in client lookup format.
   * @param locationId offering location.
   * @param programId offering program.
   * @param programYearId program year of the offering program.
   * @param offeringIntensity offering intensity.
   * @param isIncludeInActiveProgramYear if isIncludeInActiveProgramYear is true/supplied then both active
   * and not active program year are considered.
   * @returns offerings in client lookup format.
   */
  async getProgramOfferingsOptionsList(
    locationId: number,
    programId: number,
    programYearId: number,
    offeringIntensity: OfferingIntensity,
    isIncludeInActiveProgramYear?: boolean,
  ): Promise<OptionItemAPIOutDTO[]> {
    let url = `education-program-offering/location/${locationId}/education-program/${programId}/program-year/${programYearId}`;
    url = `${url}?offeringIntensity=${offeringIntensity}`;
    if (isIncludeInActiveProgramYear) {
      url = `${url}&isIncludeInActiveProgramYear=${isIncludeInActiveProgramYear}`;
    }
    return this.getCallTyped<OptionItemAPIOutDTO[]>(this.addClientRoot(url));
  }

  /**
   * Get offering start date of a given offering.
   * @param offeringId offering id
   * @returns offering with start date value.
   */
  async getProgramOfferingStartDate(
    offeringId: number,
  ): Promise<OfferingStartDateAPIOutDTO> {
    const url = `education-program-offering/${offeringId}`;
    return this.getCallTyped<OfferingStartDateAPIOutDTO>(
      this.addClientRoot(url),
    );
  }

  /**
   * Assess an offering to approve or decline.
   * @param offeringId
   * @param payload
   */
  async assessOffering(
    offeringId: number,
    payload: OfferingAssessmentAPIInDTO,
  ): Promise<void> {
    await this.patchCall<OfferingAssessmentAPIInDTO>(
      this.addClientRoot(`education-program-offering/${offeringId}/assess`),
      payload,
    );
  }

  /**
   * Request a change to offering to modify it's
   * properties that affect the assessment of student application.
   **During this process a new offering is created by copying the existing
   * offering and modifying the properties required.
   * @param locationId location to which the offering belongs to.
   * @param programId program to which the offering belongs to.
   * @param offeringId offering to which change is requested.
   * @param payload offering data to create the new offering.
   */
  async requestChange(
    locationId: number,
    programId: number,
    offeringId: number,
    payload: EducationProgramOfferingAPIInDTO,
  ): Promise<void> {
    try {
      const url = `education-program-offering/${offeringId}/location/${locationId}/education-program/${programId}/request-change`;
      await this.postCall<EducationProgramOfferingAPIInDTO>(
        this.addClientRoot(url),
        payload,
      );
    } catch (error: unknown) {
      this.handleAPICustomError(error);
    }
  }

  /**
   * Get all offerings that were requested for change.
   * @returns all offerings that were requested for change.
   */
  async getOfferingChangeRequests(): Promise<OfferingChangeRequestAPIOutDTO[]> {
    return this.getCallTyped<OfferingChangeRequestAPIOutDTO[]>(
      this.addClientRoot("education-program-offering/change-requests"),
    );
  }

  /**
   * For a given offering which is requested as change
   * get the summary of it's actual(preceding) offering.
   * @param offeringId actual offering id.
   * @returns preceding offering summary.
   */
  async getPrecedingOfferingSummary(
    offeringId: number,
  ): Promise<PrecedingOfferingSummaryAPIOutDTO> {
    return this.getCallTyped<PrecedingOfferingSummaryAPIOutDTO>(
      this.addClientRoot(
        `education-program-offering/${offeringId}/preceding-offering-summary`,
      ),
    );
  }

  /**
   * For a given offering which is requested as change
   * get the details of it's actual(preceding) offering.
   * @param offeringId actual offering id.
   * @returns preceding offering details.
   */
  async getPrecedingOfferingByActualOfferingId(
    offeringId: number,
  ): Promise<EducationProgramOfferingAPIOutDTO> {
    return this.getCallTyped<EducationProgramOfferingAPIOutDTO>(
      this.addClientRoot(
        `education-program-offering/${offeringId}/preceding-offering`,
      ),
    );
  }

  async assessOfferingChangeRequest(
    offeringId: number,
    payload: OfferingChangeAssessmentAPIInDTO,
  ): Promise<void> {
    await this.patchCall<OfferingChangeAssessmentAPIInDTO>(
      this.addClientRoot(
        `education-program-offering/${offeringId}/assess-change-request`,
      ),
      payload,
    );
  }

  /**
   * Process a CSV with offerings to be created under existing programs.
   * @param file file content with all information needed to create offerings.
   * @param validationOnly if true, will execute all validations and return the
   * errors and warnings. These validations are the same executed during the
   * final creation process. If false, the file will be processed and the records
   * will be inserted.
   **Validations errors are returned using different HTTP status codes.
   * @onUploadProgress event to report the upload progress.
   */
  async offeringBulkInsert(
    file: Blob,
    validationOnly: boolean,
    onUploadProgress: (progressEvent: FileUploadProgressEventArgs) => void,
  ): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);
    // Configure the request to provide upload progress status.
    const requestConfig: AxiosRequestConfig = { onUploadProgress };
    try {
      await ApiClient.FileUpload.upload(
        `education-program-offering/bulk-insert?validation-only=${validationOnly}`,
        formData,
        requestConfig,
        true,
      );
    } catch (error: unknown) {
      this.handleAPICustomError(error);
    }
  }
}
