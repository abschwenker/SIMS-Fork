import {
  Body,
  Controller,
  Get,
  Patch,
  Put,
  UnprocessableEntityException,
} from "@nestjs/common";
import { BCeIDService, UserService } from "../../services";
import BaseController from "../BaseController";
import { UserToken } from "../../auth/decorators/userToken.decorator";
import { IUserToken } from "../../auth/userToken.interface";
import { BCeIDDetailsDto } from "./models/bceid-account.dto";
import { InstitutionUserDto } from "./models/institution-user.dto";
import { InstitutionUserPersistDto } from "./models/institution-user-persist.dto";
import { SearchAccountOptions } from "../../services/bceid/search-bceid.model";
import { BCeIDAccountsDto } from "./models/bceid-accounts.dto";
import { AuthorizedParties } from "../../auth/authorized-parties.enum";
import { UserGroups } from "../../auth/user-groups.enum";
import {
  AllowAuthorizedParty,
  AllowInactiveUser,
  Groups,
} from "../../auth/decorators";
import { ApiTags } from "@nestjs/swagger";
import { BCeIDAccountTypeCodes } from "../../services/bceid/bceid.models";

@Controller("users")
@ApiTags("users")
export class UserController extends BaseController {
  constructor(
    private readonly service: UserService,
    private readonly bceidService: BCeIDService,
  ) {
    super();
  }

  @AllowAuthorizedParty(AuthorizedParties.institution)
  @AllowInactiveUser()
  @Get("bceid-account")
  async getBCeID(
    @UserToken() userToken: IUserToken,
  ): Promise<BCeIDDetailsDto | null> {
    const account = await this.bceidService.getAccountDetails(
      userToken.idp_user_name,
      // TODO: To be changed to allow basic BCeID sign in.
      BCeIDAccountTypeCodes.Business,
    );
    if (account == null) {
      return null;
    } else {
      return {
        user: {
          guid: account.user.guid,
          displayName: account.user.displayName,
          firstname: account.user.firstname,
          surname: account.user.surname,
          email: account.user.email,
        },
        institution: {
          guid: account.institution.guid,
          legalName: account.institution.legalName,
        },
      };
    }
  }

  @AllowAuthorizedParty(AuthorizedParties.institution, AuthorizedParties.aest)
  @Get("bceid-accounts")
  async getAllBCeIDs(
    @UserToken() userToken: IUserToken,
  ): Promise<BCeIDAccountsDto> {
    // Only business BCeID will execute a search on BCeID Web Services.
    // Basic BCeID need to have the full user name provided to execute the
    // getAccountDetail method on BCeID Web Services.
    const account = await this.bceidService.getAccountDetails(
      userToken.idp_user_name,
      BCeIDAccountTypeCodes.Business,
    );

    if (!account) {
      throw new UnprocessableEntityException(
        "Not able to retrieve BCeID business account details for the current authenticated user.",
      );
    }

    const searchOptions = new SearchAccountOptions();
    searchOptions.requesterUserGuid = account.user.guid;
    searchOptions.businessGuid = account.institution.guid;
    const searchResult = await this.bceidService.searchBCeIDAccounts(
      searchOptions,
    );

    const accounts = searchResult.accounts.map((account) => {
      return {
        guid: account.guid,
        displayName: account.displayName,
        email: account.email,
        firstname: account.firstname,
        surname: account.surname,
        telephone: account.telephone,
        userId: account.userId,
      };
    });

    return {
      accounts,
    };
  }

  @AllowAuthorizedParty(AuthorizedParties.institution)
  @Get("/institution")
  async institutionDetail(
    @UserToken() userToken: IUserToken,
  ): Promise<InstitutionUserDto> {
    const user = await this.service.getActiveUser(userToken.userName);
    if (!user) {
      throw new UnprocessableEntityException("No user record found for user");
    }
    const institutionUser = new InstitutionUserDto();
    institutionUser.userEmail = user.email;
    institutionUser.userFirstName = user.firstName;
    institutionUser.userLastName = user.lastName;
    return institutionUser;
  }

  @AllowAuthorizedParty(AuthorizedParties.institution)
  @Patch("/institution")
  async updateInstitutionUser(
    @UserToken() userToken: IUserToken,
    @Body() body: InstitutionUserPersistDto,
  ): Promise<void> {
    const user = await this.service.getActiveUser(userToken.userName);
    if (!user) {
      throw new UnprocessableEntityException("No user record found for user");
    }
    this.service.updateUserEmail(user.id, body.userEmail);
  }

  /**
   * Creates or updates Ministry user information.
   * @param userToken user token information to be updated.
   */
  @AllowAuthorizedParty(AuthorizedParties.aest)
  @Groups(UserGroups.AESTUser)
  @Put("aest")
  async syncAESTUser(@UserToken() userToken: IUserToken): Promise<void> {
    await this.service.syncUser(
      userToken.userName,
      userToken.email,
      userToken.givenNames,
      userToken.lastName,
    );
  }
}
