import { Injectable } from "@nestjs/common";
import {
  RecordDataModelService,
  InstitutionLocation,
  User,
} from "@sims/sims-db";
import { DataSource, In, SelectQueryBuilder } from "typeorm";
import { DesignationAgreementLocationService } from "../designation-agreement/designation-agreement-locations.service";
import {
  LocationWithDesignationStatus,
  InstitutionLocationModel,
  InstitutionLocationPrimaryContactModel,
} from "./institution-location.models";
import { transformAddressDetails } from "../../utilities";

@Injectable()
export class InstitutionLocationService extends RecordDataModelService<InstitutionLocation> {
  constructor(
    dataSource: DataSource,
    private readonly designationAgreementLocationService: DesignationAgreementLocationService,
  ) {
    super(dataSource.getRepository(InstitutionLocation));
  }

  /**
   * Save institution location.
   * @param institutionId institution to which the location
   * belongs.
   * @param data location data.
   * @param auditUserId user who is making the changes.
   * @param locationId location to be updated.
   * @returns persisted location.
   */
  async saveLocation(
    institutionId: number,
    data: InstitutionLocationModel,
    auditUserId: number,
    locationId?: number,
  ): Promise<InstitutionLocation> {
    const auditUser = { id: auditUserId } as User;
    const institution = { id: institutionId };
    const saveLocation: InstitutionLocation = {
      name: data.locationName,
      data: {
        address: transformAddressDetails(data),
      },
      primaryContact: {
        firstName: data.primaryContactFirstName,
        lastName: data.primaryContactLastName,
        email: data.primaryContactEmail,
        phone: data.primaryContactPhone,
      },
      institution: institution,
      institutionCode: data.institutionCode,
      id: locationId ?? undefined,
    } as InstitutionLocation;

    if (locationId) {
      saveLocation.modifier = auditUser;
    } else {
      saveLocation.creator = auditUser;
    }

    return this.repo.save(saveLocation);
  }

  /**
   * Updating institution location.
   * @param institutionLocationData Payload of updated data.
   * @param locationId Location Id to update.
   * @returns Updated institution Location.
   */
  async updateLocationPrimaryContact(
    institutionLocationData: InstitutionLocationPrimaryContactModel,
    locationId: number,
    auditUserId: number,
  ): Promise<InstitutionLocation> {
    const saveLocation: InstitutionLocation = {
      primaryContact: {
        firstName: institutionLocationData.primaryContactFirstName,
        lastName: institutionLocationData.primaryContactLastName,
        email: institutionLocationData.primaryContactEmail,
        phone: institutionLocationData.primaryContactPhone,
      },
      id: locationId,
      modifier: { id: auditUserId } as User,
    } as InstitutionLocation;

    return this.repo.save(saveLocation);
  }

  /**
   * Updating institution location.
   * @param institutionLocationData Payload of updated data.
   * @param locationId Location Id to update.
   * @param auditUserId user who is making the changes.
   * @returns Updated institution Location.
   */
  async updateLocation(
    institutionLocationData: InstitutionLocationModel,
    locationId: number,
    auditUserId: number,
  ): Promise<InstitutionLocation> {
    const saveLocation: InstitutionLocation = {
      name: institutionLocationData.locationName,
      data: {
        address: transformAddressDetails(institutionLocationData),
      },
      primaryContact: {
        firstName: institutionLocationData.primaryContactFirstName,
        lastName: institutionLocationData.primaryContactLastName,
        email: institutionLocationData.primaryContactEmail,
        phone: institutionLocationData.primaryContactPhone,
      },
      institutionCode: institutionLocationData.institutionCode,
      id: locationId,
      modifier: { id: auditUserId } as User,
    } as InstitutionLocation;

    return this.repo.save(saveLocation);
  }

  /**
   * Gets all locations available and return just
   * a subset of available data.
   * @returns all locations.
   */
  async getDesignatedLocations(): Promise<Partial<InstitutionLocation>[]> {
    return this.repo
      .createQueryBuilder("location")
      .select("location.id")
      .addSelect("location.name")
      .orderBy("location.name")
      .andWhere(
        `EXISTS(${this.designationAgreementLocationService
          .getExistsDesignatedLocation()
          .getSql()})`,
      )
      .getMany();
  }

  async getInstitutionLocation(
    locationId: number,
    institutionId?: number,
  ): Promise<InstitutionLocation> {
    const query = this.repo
      .createQueryBuilder("institutionLocation")
      .select([
        "institutionLocation.name",
        "institutionLocation.data",
        "institutionLocation.id",
        "institutionLocation.institutionCode",
        "institutionLocation.primaryContact",
      ])
      .where("institutionLocation.id = :locationId", {
        locationId: locationId,
      });
    if (institutionId) {
      query
        .innerJoin("institutionLocation.institution", "institution")
        .andWhere("institution.id = :id", {
          id: institutionId,
        });
    }
    return query.getOne();
  }

  async getMyInstitutionLocations(
    locationIds: number[],
  ): Promise<InstitutionLocation[]> {
    return this.repo.findBy({ id: In(locationIds) });
  }

  /**
   * Gets all locations ids for a particular institution.
   * This method is used during the login process and should be
   * as lightweight as possible. Do not expand this query unless
   * it is related to login/authorization process.
   * @param institutionId institution id.
   * @returns institution locations ids.
   */
  async getInstitutionLocationsIds(institutionId: number): Promise<number[]> {
    const allLocations = await this.repo
      .createQueryBuilder("locations")
      .select("locations.id")
      .leftJoin("locations.institution", "institutions")
      .where("institutions.id = :institutionId", { institutionId })
      .getMany();

    return allLocations.map((location) => location.id);
  }

  /**
   * Validate if all the supplied locationIds
   * in a payload belongs to the given institution.
   * @param institutionId
   * @param locations
   * @returns result which has true when incorrect location id(s) are given.
   */
  async validateInstitutionLocations(
    institutionId: number,
    locations: number[],
  ): Promise<boolean> {
    const found = await this.repo
      .createQueryBuilder("location")
      .select("1")
      .where("location.institution.id = :institutionId", { institutionId })
      .andWhere("location.id IN (:...locations)", {
        locations: locations,
      })
      .getRawMany();
    return found.length === locations.length;
  }

  /**
   * Get institution location by location id.
   * @param locationId location id
   * @returns InstitutionLocation.
   */
  async getLocation(
    locationId: number,
  ): Promise<LocationWithDesignationStatus> {
    return this.buildLocationQuery(locationId, undefined).getRawOne();
  }

  /**
   * Get institution locations by institution id.
   * @param institutionId institutionId id
   * @returns InstitutionLocations.
   */
  async getLocations(
    institutionId: number,
  ): Promise<LocationWithDesignationStatus[]> {
    return this.buildLocationQuery(undefined, institutionId).getRawMany();
  }

  private buildLocationQuery(
    locationId?: number,
    institutionId?: number,
  ): SelectQueryBuilder<InstitutionLocation> {
    const query = this.repo
      .createQueryBuilder("location")
      .select("location.name", "locationName")
      .addSelect("location.info", "locationAddress")
      .addSelect("location.id", "id")
      .addSelect("location.institutionCode", "institutionCode")
      .addSelect("location.primaryContact", "primaryContact")
      .addSelect(
        `CASE
      WHEN EXISTS(${this.designationAgreementLocationService
        .getExistsDesignatedLocation()
        .getSql()}) THEN true
      ELSE false
    END`,
        "isDesignated",
      );
    if (locationId) {
      return query.where("location.id = :locationId", { locationId });
    }

    if (institutionId) {
      return query
        .innerJoin("location.institution", "institution")
        .where("institution.id = :id", {
          id: institutionId,
        });
    }
  }
}
