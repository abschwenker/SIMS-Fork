import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { TableNames } from "../constant";
import { RecordDataModel } from "./record.model";
import { RestrictionType } from ".";

/**
 * Entity for resctrictions
 */
@Entity({ name: TableNames.Restrictions })
export class Restriction extends RecordDataModel {
  @PrimaryGeneratedColumn()
  id: number;
  /**
   * Restrction type - Federal/Provincial
   */
  @Column({
    name: "restriction_type",
    type: "enum",
    nullable: false,
  })
  restrictionType: RestrictionType;
  /**
   * Restriction code of the restriction
   */
  @Column({
    name: "restriction_code",
    nullable: false,
  })
  restrictionCode: string;
  /**
   * Description of the restriction
   */
  @Column({
    name: "description",
    nullable: true,
  })
  description?: string;
  /**
   * Maximum number of times the given restriction can be ignored
   */
  @Column({
    name: "allowed_count",
    nullable: false,
  })
  allowedCount: number;
}
