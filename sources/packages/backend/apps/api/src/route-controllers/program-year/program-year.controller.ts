import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
} from "@nestjs/common";
import { ProgramYearService } from "../../services";
import { OptionItem } from "../../types";
import BaseController from "../BaseController";
import { AllowAuthorizedParty } from "../../auth/decorators/authorized-party.decorator";
import { AuthorizedParties } from "../../auth/authorized-parties.enum";
import { ProgramYearDto } from "./models/program-year.dto";
import { ApiTags } from "@nestjs/swagger";
import { RequiresStudentAccount } from "../../auth/decorators";

@AllowAuthorizedParty(AuthorizedParties.student)
@RequiresStudentAccount()
@Controller("program-year")
@ApiTags("program-year")
export class ProgramYearController extends BaseController {
  constructor(private readonly programYearService: ProgramYearService) {
    super();
  }

  @Get("/options-list")
  async getProgramYears(): Promise<OptionItem[]> {
    const programYears = await this.programYearService.getProgramYears();

    if (!programYears) {
      throw new NotFoundException(`Program Years are not found.`);
    }

    return programYears.map((programYear) => ({
      id: programYear.id,
      description: `(${programYear.programYear}) - ${programYear.programYearDesc}`,
    }));
  }

  @Get(":id/active")
  async getActiveProgramYearById(
    @Param("id", ParseIntPipe) programYearId: number,
  ): Promise<ProgramYearDto> {
    const programYear = await this.programYearService.getActiveProgramYear(
      programYearId,
    );
    if (!programYear) {
      throw new NotFoundException(
        `Program Year Id ${programYearId} was not found.`,
      );
    }
    return {
      id: programYear.id,
      programYear: programYear.programYear,
      programYearDesc: programYear.programYearDesc,
      formName: programYear.formName,
    };
  }
}
