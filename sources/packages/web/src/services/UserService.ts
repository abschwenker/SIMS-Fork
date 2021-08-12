import ApiClient from "./http/ApiClient";
import {
  BCeIDDetailsDto,
  BCeIDAccountsDto,
  InstitutionUserDetailsDto,
} from "../types/contracts/UserContract";

export class UserService {
  // Share Instance
  private static instance: UserService;

  public static get shared(): UserService {
    return this.instance || (this.instance = new this());
  }

  async checkUser(authHeader?: any): Promise<boolean> {
    return ApiClient.User.checkUser(authHeader);
  }

  async getBCeIDAccountDetails(
    authHeader?: any,
  ): Promise<BCeIDDetailsDto | null> {
    try {
      return await ApiClient.User.bceidAccount(authHeader);
    } catch (excp) {
      return null;
    }
  }

  async getBCeIDAccounts(authHeader?: any): Promise<BCeIDAccountsDto | null> {
    try {
      return await ApiClient.User.bceidAccounts(authHeader);
    } catch (excp) {
      return null;
    }
  }

  async checkActiveUser(authHeader?: any): Promise<boolean> {
    return ApiClient.User.checkActiveUser(authHeader);
  }

  async getInstitutionUser(
    authHeader?: any,
  ): Promise<InstitutionUserDetailsDto> {
    return ApiClient.User.getinstitutionUser(authHeader);
  }
}
