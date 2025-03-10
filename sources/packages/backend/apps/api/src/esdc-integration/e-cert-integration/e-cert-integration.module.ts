import { Module } from "@nestjs/common";
import { AuthModule } from "../../auth/auth.module";
import {
  DisbursementScheduleService,
  StudentRestrictionService,
  DisbursementScheduleErrorsService,
  RestrictionService,
  StudentService,
  SFASIndividualService,
} from "../../services";
import { SequenceControlService } from "@sims/services";
import { ECertFileHandler } from "./e-cert-file-handler";
import { ECertFullTimeFileFooter } from "./e-cert-full-time-integration/e-cert-files/e-cert-file-footer";
import { ECertFullTimeFileHeader } from "./e-cert-full-time-integration/e-cert-files/e-cert-file-header";
import { ECertFullTimeIntegrationService } from "./e-cert-full-time-integration/e-cert-full-time-integration.service";
import { ECertPartTimeFileFooter } from "./e-cert-part-time-integration/e-cert-files/e-cert-file-footer";
import { ECertPartTimeFileHeader } from "./e-cert-part-time-integration/e-cert-files/e-cert-file-header";
import { ECertPartTimeIntegrationService } from "./e-cert-part-time-integration/e-cert-part-time-integration.service";
import { ConfigModule } from "@sims/utilities/config";
import { SshService } from "@sims/integrations/services";

@Module({
  imports: [AuthModule, ConfigModule],
  providers: [
    SshService,
    ECertFullTimeIntegrationService,
    ECertPartTimeIntegrationService,
    SequenceControlService,
    DisbursementScheduleService,
    StudentRestrictionService,
    ECertFileHandler,
    ECertPartTimeFileHeader,
    ECertPartTimeFileFooter,
    ECertFullTimeFileHeader,
    ECertFullTimeFileFooter,
    DisbursementScheduleErrorsService,
    RestrictionService,
    StudentService,
    SFASIndividualService,
  ],
  exports: [
    ECertFullTimeIntegrationService,
    ECertPartTimeIntegrationService,
    ECertFileHandler,
  ],
})
export class ECertIntegrationModule {}
