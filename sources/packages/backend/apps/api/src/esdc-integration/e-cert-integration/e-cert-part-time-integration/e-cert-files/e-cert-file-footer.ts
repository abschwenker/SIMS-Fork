import {
  NUMBER_FILLER,
  RecordTypeCodes,
  SPACE_FILLER,
} from "../../models/e-cert-integration-model";
import { ECertFileFooter } from "../../e-cert-files/e-cert-file-footer";
import { StringBuilder } from "@sims/utilities";

/**
 * Footer of a Part-Time E-Cert file.
 * The documentation about it is available on the document
 * 'CSLP-AppendixF2AsReviewed2016-FileLayouts BC Files V3(HAJ-CB EDITS) In ESDC Folder'.
 */
export class ECertPartTimeFileFooter extends ECertFileFooter {
  totalAmountDisbursed: number;

  getFixedFormat(): string {
    const footer = new StringBuilder();
    footer.append(this.recordTypeCode);
    footer.appendWithStartFiller(this.recordCount, 9, NUMBER_FILLER);
    footer.appendWithStartFiller(this.totalAmountDisbursed, 15, NUMBER_FILLER);
    footer.repeatAppend(SPACE_FILLER, 730); //Trailing spaces.
    return footer.toString();
  }

  createFromLine(line: string): ECertPartTimeFileFooter {
    const footer = new ECertPartTimeFileFooter();
    footer.recordTypeCode = line.substring(0, 3) as RecordTypeCodes;
    // Here total record count is the total records.
    footer.recordCount =
      parseInt(line.substring(43, 52)) + parseInt(line.substring(52, 61));
    footer.totalSINHash = parseInt(line.substring(61, 76));
    return footer;
  }

  getFeedbackFooterRecordType(): RecordTypeCodes {
    return RecordTypeCodes.ECertPartTimeFeedbackFooter;
  }
}
