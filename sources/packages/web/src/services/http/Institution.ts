import HttpBaseClient from "./common/HttpBaseClient";
import {
  InstitutionDto,
  InstitutionDetailDto,
  UpdateInstitutionDto,
} from "../../types";
import { AxiosResponse } from "axios";
import { InstitutionUserTypeAndRoleResponseDto } from "../../types/contracts/institution/InstitutionUserTypeAndRoleResponseDto";

export class InstitutionApi extends HttpBaseClient {
  public async createInstitution(
    createInstitutionDto: InstitutionDto,
  ): Promise<void> {
    try {
      await this.apiClient.post(
        "institution",
        createInstitutionDto,
        this.addAuthHeader(),
      );
    } catch (error) {
      this.handleRequestError(error);
      throw error;
    }
  }

  public async updateInstitution(data: UpdateInstitutionDto) {
    try {
      await this.apiClient.patch("institution", data, this.addAuthHeader());
    } catch (error) {
      this.handleRequestError(error);
      throw error;
    }
  }

  public async getDetail(): Promise<InstitutionDetailDto> {
    try {
      const resp: AxiosResponse<InstitutionDetailDto> = await this.getCall(
        "institution",
      );
      return resp.data;
    } catch (error) {
      this.handleRequestError(error);
      throw error;
    }
  }

  public async sync() {
    try {
      await this.apiClient.patch("institution/sync", {}, this.addAuthHeader());
    } catch (error) {
      this.handleRequestError(error);
      throw error;
    }
  }

  public async getUsers() {
    try {
      const resp = await this.apiClient.get(
        "institution/users",
        this.addAuthHeader(),
      );
      return resp.data;
    } catch (error) {
      this.handleRequestError(error);
      throw error;
    }
  }

  public async getUserTypeAndRoles(): Promise<
    InstitutionUserTypeAndRoleResponseDto
  > {
    try {
      const resp = await this.apiClient.get(
        "institution/user-types-roles",
        this.addAuthHeader(),
      );
      return resp.data as InstitutionUserTypeAndRoleResponseDto;
    } catch (error) {
      this.handleRequestError(error);
      throw error;
    }
  }
}
