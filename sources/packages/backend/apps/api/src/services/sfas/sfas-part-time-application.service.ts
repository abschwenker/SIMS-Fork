import { Injectable } from "@nestjs/common";
import { DataSource, Brackets } from "typeorm";
import { DataModelService, SFASPartTimeApplications } from "@sims/sims-db";
import { LoggerService, InjectLogger } from "@sims/utilities/logger";
import { getUTC, getISODateOnlyString } from "@sims/utilities";
import { SFASDataImporter } from "./sfas-data-importer";
import { SFASRecordIdentification } from "../../sfas-integration/sfas-files/sfas-record-identification";
import { SFASPartTimeApplicationRecord } from "../../sfas-integration/sfas-files/sfas-part-time-application-record";

/**
 * Manages the part time application data related to an individual/student in SFAS.
 */
@Injectable()
export class SFASPartTimeApplicationsService
  extends DataModelService<SFASPartTimeApplications>
  implements SFASDataImporter
{
  constructor(dataSource: DataSource) {
    super(dataSource.getRepository(SFASPartTimeApplications));
  }

  /**
   * Import a record from SFAS. This method will be invoked by SFAS
   * import processing service when the record type is detected as
   * RecordTypeCodes.PartTimeApplicationDataRecord.
   * ! when this scenarios was tested with test data, it was
   * ! having application id duplication with different
   * ! individual id, which will not happen in production
   * ! as confirmed from client.
   */
  async importSFASRecord(
    record: SFASRecordIdentification,
    extractedDate: Date,
  ): Promise<void> {
    // The insert of SFAS record always comes from an external source through integration.
    // Hence all the date fields are parsed as date object from external source as their date format
    // may not be necessarily ISO date format.
    const sfasApplication = new SFASPartTimeApplicationRecord(record.line);
    const application = new SFASPartTimeApplications();
    application.individualId = sfasApplication.individualId;
    application.id = sfasApplication.applicationId;
    application.startDate = getISODateOnlyString(sfasApplication.startDate);
    application.endDate = getISODateOnlyString(sfasApplication.endDate);
    application.CSGPAward = sfasApplication.CSGPAward;
    application.SBSDAward = sfasApplication.SBSDAward;
    application.extractedAt = getUTC(extractedDate);
    await this.repo.save(application, { reload: false, transaction: false });
  }

  /**
   * Validates before an application submission to see if there is an overlapping SFAS part-time application existing.
   * @param sin
   * @param birthDate
   * @param lastName
   * @param studyStartDate
   * @param studyEndDate
   * @returns SFAS part-time application.
   */
  async validateDateOverlap(
    sin: string,
    birthDate: string,
    lastName: string,
    studyStartDate: string,
    studyEndDate: string,
  ): Promise<SFASPartTimeApplications> {
    return this.repo
      .createQueryBuilder("sfasPTApplication")
      .select(["sfasPTApplication.id"])
      .innerJoin("sfasPTApplication.individual", "sfasPTstudent")
      .where("lower(sfasPTstudent.lastName) = lower(:lastName)", { lastName })
      .andWhere("sfasPTstudent.sin = :sin", { sin })
      .andWhere("sfasPTstudent.birthDate = :birthDate", { birthDate })
      .andWhere(
        new Brackets((qb) => {
          qb.where(
            "sfasPTApplication.startDate BETWEEN :startDatePT AND :endDatePT",
            { startDatePT: studyStartDate, endDatePT: studyEndDate },
          )
            .orWhere(
              "sfasPTApplication.endDate BETWEEN :startDatePT AND :endDatePT",
              { startDatePT: studyStartDate, endDatePT: studyEndDate },
            )
            .orWhere(
              ":startDatePT BETWEEN sfasPTApplication.startDate AND sfasPTApplication.endDate",
              { startDatePT: studyStartDate },
            )
            .orWhere(
              ":endDatePT BETWEEN sfasPTApplication.startDate AND sfasPTApplication.endDate",
              { endDatePT: studyEndDate },
            );
        }),
      )
      .getOne();
  }
  @InjectLogger()
  logger: LoggerService;
}
