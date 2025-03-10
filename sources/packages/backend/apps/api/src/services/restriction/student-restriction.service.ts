import { Injectable } from "@nestjs/common";
import {
  RecordDataModelService,
  StudentRestriction,
  RestrictionType,
  NoteType,
  User,
  Restriction,
  Student,
  Application,
  EducationProgramOffering,
  RestrictionActionType,
} from "@sims/sims-db";
import {
  ArrayContains,
  DataSource,
  EntityManager,
  In,
  Not,
  SelectQueryBuilder,
} from "typeorm";
import { CustomNamedError } from "@sims/utilities";
import { RestrictionService } from "./restriction.service";
import { StudentService } from "../student/student.service";
import { RestrictionCode } from "./models/restriction.model";
import {
  NotificationActionsService,
  StudentRestrictionAddedNotificationOptions,
} from "@sims/services/notifications";
export const RESTRICTION_NOT_ACTIVE = "RESTRICTION_NOT_ACTIVE";
export const RESTRICTION_NOT_PROVINCIAL = "RESTRICTION_NOT_PROVINCIAL";

/**
 * While performing a possible huge amount of select,
 * breaks the execution in chunks.
 */
const NOTIFICATIONS_SELECT_CHUNK_SIZE = 1000;

/**
 * Service layer for Student Restriction.
 */
@Injectable()
export class StudentRestrictionService extends RecordDataModelService<StudentRestriction> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly restrictionService: RestrictionService,
    private readonly studentService: StudentService,
    private readonly notificationActionsService: NotificationActionsService,
  ) {
    super(dataSource.getRepository(StudentRestriction));
  }

  /**
   * Creates a 'select' query that could be used in an 'exists' or
   * 'not exists' where clause to define if the student has some
   * active restrictions that must prevent him for certain
   * critical operations, for instance, to have money disbursed.
   * ! This query will assume that a join to 'student.id' is present
   * ! in the master query.
   * ! This query is expecting the consumer function to set restrictionActions
   * ! parameter.
   * @param checkAll is by default false, checkAll decides if all the
   * elements in the restrictionActions should be checked (i.e checkAll = true)
   * or any one of the elements is to be checked (i.e checkAll = false).
   * @param isStudentId is flag that will allow consumer function to set
   * student id as parameter, by default its false.
   * @param restrictionActionVariable is the parameter name, can be overridden
   * from default 'restrictionActions' to use another set of restrictions in
   * same query.
   * @returns 'select' query that could be used in an 'exists' or
   * 'not exists'.
   */
  getExistsBlockRestrictionQuery(
    checkAll = false,
    isStudentId = false,
    restrictionActionVariable = "restrictionActions",
  ): SelectQueryBuilder<StudentRestriction> {
    const query = this.repo
      .createQueryBuilder("studentRestrictions")
      .select("1")
      .innerJoin("studentRestrictions.restriction", "restrictions")
      .innerJoin("studentRestrictions.student", "restrictionStudent")
      .where("studentRestrictions.isActive = true");
    if (isStudentId) {
      query.andWhere("restrictionStudent.id = :studentId");
    } else {
      query.andWhere("restrictionStudent.id = student.id");
    }

    if (checkAll) {
      query.andWhere(
        `restrictions.actionType @> :${restrictionActionVariable}`,
      );
    } else {
      query.andWhere(
        `restrictions.actionType && :${restrictionActionVariable}`,
      );
    }
    query.limit(1);
    return query;
  }

  /**
   * Service method to get all restrictions as a summary for a student.
   * @param studentId
   * @param onlyActive is a flag, which decides whether to select all
   * restrictions (i.e false) or to select only active restrictions (i.e true).
   * @returns Student restrictions.
   */
  async getStudentRestrictionsById(
    studentId: number,
    onlyActive = false,
  ): Promise<StudentRestriction[]> {
    const query = this.repo
      .createQueryBuilder("studentRestrictions")
      .select([
        "studentRestrictions.id",
        "studentRestrictions.isActive",
        "studentRestrictions.updatedAt",
        "studentRestrictions.createdAt",
        "restriction.restrictionType",
        "restriction.restrictionCategory",
        "restriction.restrictionCode",
        "restriction.description",
        "restriction.notificationType",
      ])
      .innerJoin("studentRestrictions.restriction", "restriction")
      .innerJoin("studentRestrictions.student", "student")
      .where("student.id = :studentId", { studentId });
    if (onlyActive) {
      query.andWhere("studentRestrictions.isActive = true");
    }
    return query
      .orderBy("studentRestrictions.isActive", "DESC")
      .addOrderBy("studentRestrictions.createdAt", "DESC")
      .getMany();
  }

  /**
   * Get student restriction detail.
   * @param studentId student id.
   * @param studentRestrictionId student restriction id.
   * @returns Student Restriction details.
   */
  async getStudentRestrictionDetailsById(
    studentId: number,
    studentRestrictionId: number,
  ): Promise<StudentRestriction> {
    return this.repo
      .createQueryBuilder("studentRestrictions")
      .select([
        "studentRestrictions.id",
        "studentRestrictions.isActive",
        "studentRestrictions.updatedAt",
        "studentRestrictions.createdAt",
        "creator.firstName",
        "creator.lastName",
        "modifier.firstName",
        "modifier.lastName",
        "restriction.restrictionType",
        "restriction.restrictionCategory",
        "restriction.description",
        "restriction.restrictionCode",
        "restrictionNote.description",
        "resolutionNote.description",
      ])
      .innerJoin("studentRestrictions.restriction", "restriction")
      .leftJoin("studentRestrictions.creator", "creator")
      .leftJoin("studentRestrictions.modifier", "modifier")
      .innerJoin("studentRestrictions.student", "student")
      .leftJoin("studentRestrictions.restrictionNote", "restrictionNote")
      .leftJoin("studentRestrictions.resolutionNote", "resolutionNote")
      .where("student.id = :studentId", { studentId })
      .andWhere("studentRestrictions.id = :studentRestrictionId", {
        studentRestrictionId,
      })
      .getOne();
  }

  /**
   * Add provincial restriction to student.
   * @param studentId student to whom the restriction is added.
   * @param auditUserId user who is adding restriction.
   * @param restrictionId restriction.
   * @param noteDescription notes added on adding restriction.
   * @returns persisted student restriction.
   */
  async addProvincialRestriction(
    studentId: number,
    auditUserId: number,
    restrictionId: number,
    noteDescription: string,
  ): Promise<StudentRestriction> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const note = await this.studentService.createStudentNote(
        studentId,
        NoteType.Restriction,
        noteDescription,
        auditUserId,
        transactionalEntityManager,
      );
      const studentRestriction = new StudentRestriction();
      studentRestriction.student = { id: studentId } as Student;
      studentRestriction.restriction = {
        id: restrictionId,
      } as Restriction;
      studentRestriction.creator = { id: auditUserId } as User;
      studentRestriction.restrictionNote = note;
      const newRestriction = await transactionalEntityManager
        .getRepository(StudentRestriction)
        .save(studentRestriction);
      await this.createNotifications([newRestriction.id], auditUserId, {
        entityManager: transactionalEntityManager,
      });
      return studentRestriction;
    });
  }

  /**
   * Resolve provincial restriction.
   * @param studentId Student who's restriction to be resolved.
   * @param studentRestrictionId student restriction.
   * @param userId User who is resolving the restriction.
   * @param noteDescription notes added during the resolution.
   * @returns resolved student restriction.
   */
  async resolveProvincialRestriction(
    studentId: number,
    studentRestrictionId: number,
    userId: number,
    noteDescription: string,
  ): Promise<void> {
    const studentRestrictionEntity = await this.repo.findOne({
      where: {
        id: studentRestrictionId,
        student: { id: studentId } as Student,
        isActive: true,
      },
      relations: { restriction: true },
    });

    if (!studentRestrictionEntity) {
      throw new CustomNamedError(
        "The restriction neither assigned to student nor active. Only active restrictions can be resolved.",
        RESTRICTION_NOT_ACTIVE,
      );
    }

    if (
      studentRestrictionEntity.restriction.restrictionType !==
      RestrictionType.Provincial
    ) {
      throw new CustomNamedError(
        "The given restriction type is not Provincial. Only provincial restrictions can be resolved by application user.",
        RESTRICTION_NOT_PROVINCIAL,
      );
    }
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const note = await this.studentService.createStudentNote(
        studentId,
        NoteType.Restriction,
        noteDescription,
        userId,
        transactionalEntityManager,
      );
      const studentRestriction = new StudentRestriction();
      studentRestriction.id = studentRestrictionId;
      studentRestriction.modifier = { id: userId } as User;
      studentRestriction.isActive = false;
      studentRestriction.resolutionNote = note;
      await transactionalEntityManager
        .getRepository(StudentRestriction)
        .save(studentRestriction);
    });
  }

  /**
   * Checks if the requested student has
   * any or all requested restriction actions.
   * @param studentId student Id
   * @param restrictionActions list of restriction actions
   * @param checkAll is by default false, checkAll decides if the all the
   * elements in the restrictionActions should be checked (i.e checkAll = true)
   * or any one of the elements is to be checked (i.e checkAll = false).
   * @returns boolean, true if the restriction action is present
   * for the student, else false.
   */
  async hasRestrictionAction(
    studentId: number,
    restrictionActions: RestrictionActionType[],
    checkAll = false,
  ): Promise<boolean> {
    const query = this.getExistsBlockRestrictionQuery(
      checkAll,
      true,
    ).setParameters({
      studentId,
      restrictionActions,
    });
    return !!(await query.getRawOne());
  }

  /**
   * Checks if the student has an active requested restriction.
   * @param studentId student id.
   * @param restrictionCode restriction code.
   * @returns true, if the student has the requested active
   * restriction code else false.
   */
  async studentHasRestriction(
    studentId: number,
    restrictionCode: string,
  ): Promise<boolean> {
    return !!(await this.repo
      .createQueryBuilder("studentRestrictions")
      .select("studentRestrictions.id")
      .innerJoin("studentRestrictions.restriction", "restriction")
      .innerJoin("studentRestrictions.student", "student")
      .where("student.id = :studentId", { studentId })
      .andWhere("studentRestrictions.isActive = true")
      .andWhere("restriction.restrictionCode = :restrictionCode", {
        restrictionCode,
      })
      .limit(1)
      .getOne());
  }

  /**
   * Create a new student restriction object.
   * @param studentId student id.
   * @param restrictionCode restriction code.
   * @param auditUserId audit user id
   * @param applicationId application id.
   * @returns a new student restriction object.
   */
  async createRestrictionToSave(
    studentId: number,
    restrictionCode: RestrictionCode,
    auditUserId: number,
    applicationId: number,
  ): Promise<StudentRestriction> {
    const restriction = await this.restrictionService.getRestrictionByCode(
      restrictionCode,
    );
    if (!restriction) {
      throw new Error(
        `Requested restriction code ${restrictionCode} not found.`,
      );
    }
    const studentRestriction = new StudentRestriction();
    studentRestriction.restriction = {
      id: restriction.id,
    } as Restriction;
    studentRestriction.student = { id: studentId } as Student;
    studentRestriction.application = { id: applicationId } as Application;
    studentRestriction.creator = { id: auditUserId } as User;
    return studentRestriction;
  }

  /**
   * Verify if the student has a valid SIN to apply to the particular offering.
   * The SIN number must be a permanent one or a temporary with expiry date later
   * then the end date of the offering.
   * Case the SIN is not valid the student can still apply to the offering but a
   * restriction will be created to stop funding to be disbursed till the a valid
   * SIN is provided.
   * @param studentId student to be validate.
   * @param offeringId offering to be verified.
   * @param applicationId related application. Used as additional information case
   * a student restriction will be created.
   * @param auditUserId user that should be considered the one that is causing the changes.
   * @param entityManager manages the transaction where this operation must be executed.
   */
  async assessSINRestrictionForOfferingId(
    studentId: number,
    offeringId: number,
    applicationId: number,
    auditUserId: number,
    entityManager: EntityManager,
  ): Promise<void> {
    const student = await entityManager
      .getRepository(Student)
      .createQueryBuilder("student")
      .select([
        "student.id",
        "sinValidation.id",
        "sinValidation.isValidSIN",
        "sinValidation.temporarySIN",
        "sinValidation.sinExpiryDate",
      ])
      .innerJoin("student.sinValidation", "sinValidation")
      .where("student.id = :studentId", { studentId })
      .getOne();

    if (!student.sinValidation.temporarySIN) {
      // SIN is not temporary so no restriction should be created.
      return;
    }

    const hasSINRestriction = await this.studentHasRestriction(
      studentId,
      RestrictionCode.SINF,
    );
    if (hasSINRestriction) {
      // The student already has an active SIN restriction, avoid adding it again.
      return;
    }

    // By default assume that the temporary SIN does not have an expiry
    // date defined and the restriction must be created.
    let mustCreateSINException = true;
    if (student.sinValidation.sinExpiryDate) {
      // Temporary SIN has an expiry date and it must be validated with the end date of the offering.
      const offering = await entityManager
        .getRepository(EducationProgramOffering)
        .findOne({ where: { id: offeringId }, select: { studyEndDate: true } });
      // Check if the SIN expiry date is later than the offering end date.
      mustCreateSINException =
        new Date(offering.studyEndDate) >
        new Date(student.sinValidation.sinExpiryDate);
    }

    if (mustCreateSINException) {
      const restriction = await this.createRestrictionToSave(
        studentId,
        RestrictionCode.SINF,
        auditUserId,
        applicationId,
      );
      const newRestriction = await entityManager
        .getRepository(StudentRestriction)
        .save(restriction);
      await this.createNotifications([newRestriction.id], auditUserId, {
        entityManager,
      });
    }
  }

  /**
   * Generate notifications for newly created student restrictions when needed.
   * @param restrictionsIds ids to generate the notifications.
   * @param auditUserId user that should be considered the one that is causing the changes.
   * @param options options for the student restriction notification.
   */
  async createNotifications(
    restrictionsIds: number[],
    auditUserId: number,
    options?: StudentRestrictionAddedNotificationOptions,
  ): Promise<void> {
    const restrictions = await this.getRestrictionsForNotifications(
      restrictionsIds,
      options?.entityManager,
    );

    if (!restrictions?.length) {
      // There are no notifications to be sent.
      return;
    }

    const notifications = restrictions.map((restriction) => ({
      givenNames: restriction.student.user.firstName,
      lastName: restriction.student.user.lastName,
      toAddress: restriction.student.user.email,
      userId: restriction.student.user.id,
    }));
    await this.notificationActionsService.sendStudentRestrictionAddedNotification(
      notifications,
      auditUserId,
      options,
    );
  }

  /**
   * Gets the notifications information for student restrictions that are
   * eligible to generate a notification (actionType not defined as NoEffect).
   * @param restrictionIds student restriction ids.
   * @param entityManager optional repository that can be provided, for instance,
   * to execute the command as part of an existing transaction. If not provided
   * the local repository will be used instead.
   * @returns student restrictions eligible to generate a notification.
   */
  private async getRestrictionsForNotifications(
    restrictionIds: number[],
    entityManager?: EntityManager,
  ): Promise<StudentRestriction[]> {
    const repository =
      entityManager?.getRepository(StudentRestriction) ?? this.repo;
    // Copy the input array to avoid changing the one received by parameter.
    const idsToProcess = [...restrictionIds];
    // Restrictions to be returned and must have a notification created.
    const allRestrictions: StudentRestriction[] = [];
    while (idsToProcess.length > 0) {
      // Breaks the execution in chunks to allow the selects of a huge amount of records.
      // The query will fail over a 65535 parameters. Even not being the expected amount of records,
      // the code will be able to process this amount under an unusual circumstance.
      const ids = idsToProcess.splice(0, NOTIFICATIONS_SELECT_CHUNK_SIZE);
      const restrictions = await repository.find({
        select: {
          id: true,
          student: {
            id: true,
            user: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        relations: {
          student: { user: true },
        },
        where: {
          id: In(ids),
          restriction: {
            actionType: Not(ArrayContains([RestrictionActionType.NoEffect])),
          },
        },
      });
      allRestrictions.push(...restrictions);
    }

    return allRestrictions;
  }
}
