require("../../../../../env_setup");
import { Test, TestingModule } from "@nestjs/testing";
import {
  ApplicationService,
  ConfigService,
  EducationProgramOfferingService,
  INVALID_OPERATION_IN_THE_CURRENT_STATUS,
  KeycloakService,
  MSFAANumberService,
  StudentFileService,
  TokensService,
} from "../../../../api/src/services";
import { SequenceControlService } from "@sims/services";
import { DataSource, Repository } from "typeorm";
import {
  DatabaseModule,
  Application,
  ApplicationStatus,
  MSFAANumber,
  RelationshipStatus,
  Student,
} from "@sims/sims-db";
import { createMockedJwtService } from "../../../../api/src/testHelpers/mocked-providers/jwt-service-mock";
import { createFakeApplication } from "../../../../api/src/testHelpers/fake-entities/application-fake";
import {
  createFakeEducationProgramOffering,
  createFakeMSFAANumber,
  createFakeStudent,
  createFakeStudentAssessment,
} from "../../../../api/src/testHelpers/fake-entities";
import * as dayjs from "dayjs";
import { MAX_MSFAA_VALID_DAYS } from "@sims/utilities";

const createFakeApplicationInAssessment = (student: Student): Application => {
  const fakeApplication = createFakeApplication();
  fakeApplication.student = student;
  fakeApplication.relationshipStatus = RelationshipStatus.Single;
  fakeApplication.applicationStatus = ApplicationStatus.assessment;
  return fakeApplication;
};

const createDateInMSFAAValidPeriod = (increment: number): Date => {
  return dayjs()
    .subtract(MAX_MSFAA_VALID_DAYS + increment, "days")
    .toDate();
};

describe.skip("ApplicationService", () => {
  let applicationService: ApplicationService;
  let msfaaNumberService: MSFAANumberService;
  let applicationRepository: Repository<Application>;
  let msfaaNumberRepository: Repository<MSFAANumber>;
  let studentRepository: Repository<Student>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        ApplicationService,
        StudentFileService,
        EducationProgramOfferingService,
        SequenceControlService,
        MSFAANumberService,
        KeycloakService,
        ConfigService,
        TokensService,
        createMockedJwtService(),
      ],
    }).compile();

    const dataSource = module.get(DataSource);
    applicationService = module.get(ApplicationService);
    msfaaNumberService = module.get(MSFAANumberService);
    applicationRepository = dataSource.getRepository(Application);
    msfaaNumberRepository = dataSource.getRepository(MSFAANumber);
    studentRepository = dataSource.getRepository(Student);
    jest.spyOn(msfaaNumberService, "createMSFAANumber");
  });

  describe("associateMSFAANumber", () => {
    it("should throw an exception when application is not in the correct state", async () => {
      // Create fake application to have the MSFAA associated.
      const fakeApplication = createFakeApplication();
      fakeApplication.applicationStatus = ApplicationStatus.submitted;
      const testApplication = await applicationRepository.save(fakeApplication);

      try {
        await applicationService.associateMSFAANumber(testApplication.id);
      } catch (error) {
        expect(error.name === INVALID_OPERATION_IN_THE_CURRENT_STATUS);
      } finally {
        await applicationRepository.remove(testApplication);
      }
    });

    it("should associate a pending MSFAA as a priority when it exists", async () => {
      // Student used along this test.
      const testStudent = await studentRepository.save(createFakeStudent());
      // MSFAA record to be used along this test.
      const fakeMSFAANumber = createFakeMSFAANumber(testStudent);
      // Enforce that the MSFAA will be in pending state.
      fakeMSFAANumber.dateSigned = null;
      // Create fake application to have the MSFAA associated.
      const fakeApplication = createFakeApplicationInAssessment(testStudent);
      const testApplication = await applicationRepository.save(fakeApplication);
      fakeMSFAANumber.referenceApplication = fakeApplication;
      const testMSFAANumber = await msfaaNumberRepository.save(fakeMSFAANumber);

      try {
        const savedApplication = await applicationService.associateMSFAANumber(
          testApplication.id,
        );
        expect(savedApplication.msfaaNumber).toBeTruthy();
        expect(savedApplication.msfaaNumber.id).toBe(testMSFAANumber.id);
      } finally {
        await studentRepository.remove(testStudent);
      }
    });

    it("should associate an existing MSFAA as a priority when it was signed inside the validity period.", async () => {
      // Student used along this test.
      const testStudent = await studentRepository.save(createFakeStudent());
      // MSFAA record to be used along this test.
      const fakeMSFAANumber = createFakeMSFAANumber(testStudent);
      // Enforce that the MSFAA will be in a valid period.
      fakeMSFAANumber.dateSigned = createDateInMSFAAValidPeriod(-1);
      // Create fake application to have the MSFAA associated.
      const fakeApplication = createFakeApplicationInAssessment(testStudent);
      const testApplication = await applicationRepository.save(fakeApplication);
      fakeMSFAANumber.referenceApplication = fakeApplication;
      const testMSFAANumber = await msfaaNumberRepository.save(fakeMSFAANumber);

      try {
        const savedApplication = await applicationService.associateMSFAANumber(
          testApplication.id,
        );
        expect(savedApplication.msfaaNumber).toBeTruthy();
        expect(savedApplication.msfaaNumber.id).toBe(testMSFAANumber.id);
      } finally {
        await studentRepository.remove(testStudent);
      }
    });

    it("should create a new MSFAA record when a completed and signed application exists but the MSFAA period is expired", async () => {
      // Student used along this test.
      const testStudent = await studentRepository.save(createFakeStudent());
      // MSFAA record to be used.
      const fakeMSFAANumber = createFakeMSFAANumber(testStudent);
      // Make the dateSigned old enough to be considered expired.
      fakeMSFAANumber.dateSigned = createDateInMSFAAValidPeriod(1);
      const testMSFAANumber = await msfaaNumberRepository.save(fakeMSFAANumber);

      // Create a completed and signed fake application.
      const fakeCompletedApplication = createFakeApplication();
      fakeCompletedApplication.student = testStudent;
      // Make the application be considered outside the valid period.
      // TODO: Create Date MSFAA In MSFAA Valid Period with increment 1.
      fakeCompletedApplication.msfaaNumber = testMSFAANumber;
      fakeCompletedApplication.applicationStatus = ApplicationStatus.completed;
      const testCompletedApplication = await applicationRepository.save(
        fakeCompletedApplication,
      );

      // Create an application to receive the new MSFAA.
      const fakeApplication = createFakeApplicationInAssessment(testStudent);
      const testApplication = await applicationRepository.save(fakeApplication);

      try {
        const savedApplication = await applicationService.associateMSFAANumber(
          testApplication.id,
        );
        expect(savedApplication.msfaaNumber).toBeTruthy();
        expect(savedApplication.msfaaNumber.id).not.toBe(testMSFAANumber.id);
        expect(msfaaNumberService.createMSFAANumber).toHaveBeenCalled();
      } finally {
        await applicationRepository.remove(testCompletedApplication);
        await msfaaNumberRepository.remove(testMSFAANumber);
        await studentRepository.remove(testStudent);
      }
    });

    it("should reuse an existing MSFAA record when a complete and signed application exists and it is not expired", async () => {
      // Student used along this test.
      const testStudent = await studentRepository.save(createFakeStudent());
      // MSFAA record to be used along this test.
      const fakeMSFAANumber = createFakeMSFAANumber(testStudent);
      // Make the dateSigned be expired.
      // This will force the MSFAA to be considered valid due to the
      // previous application offering end date and current application
      // offering start date, since the MSFAA is expired.
      fakeMSFAANumber.dateSigned = createDateInMSFAAValidPeriod(1);
      const testMSFAANumber = await msfaaNumberRepository.save(fakeMSFAANumber);

      // Create a completed and signed fake application wth an
      // offering end date still inside the MSFAA valid period.
      const fakeCompletedApplication = createFakeApplication();
      fakeCompletedApplication.student = testStudent;
      // Make the application be considered still in the valid MSFAA period.
      // TODO: Create Date MSFAA In MSFAA Valid Period with increment -1.
      fakeCompletedApplication.msfaaNumber = testMSFAANumber;
      fakeCompletedApplication.applicationStatus = ApplicationStatus.completed;
      const testCompletedApplication = await applicationRepository.save(
        fakeCompletedApplication,
      );

      // Create an application to receive the new MSFAA.
      const fakeApplication = createFakeApplicationInAssessment(testStudent);
      const testApplication = await applicationRepository.save(fakeApplication);

      try {
        const savedApplication = await applicationService.associateMSFAANumber(
          testApplication.id,
        );
        expect(savedApplication.msfaaNumber).toBeTruthy();
        expect(savedApplication.msfaaNumber.id).toBe(testMSFAANumber.id);
      } finally {
        await applicationRepository.remove(testCompletedApplication);
        await applicationRepository.remove(testApplication);
        await msfaaNumberRepository.remove(testMSFAANumber);
        await studentRepository.remove(testStudent);
      }
    });
  });

  describe("getPreviouslySignedApplication", () => {
    it("should be able to find a completed application with an MSFAA number associated", async () => {
      // Student used along this test.
      const testStudent = await studentRepository.save(createFakeStudent());
      // MSFAA record to be used along this test.
      const fakeMSFAANumber = createFakeMSFAANumber(testStudent);
      fakeMSFAANumber.dateSigned = new Date();
      const testMSFAANumber = await msfaaNumberRepository.save(fakeMSFAANumber);
      // Date to be assigned to the offering end date of the record to be retrieved.
      const expectedEndDate = new Date();
      expectedEndDate.setHours(0, 0, 0, 0);
      // Create assessment
      const originalAssessment = createFakeStudentAssessment();
      originalAssessment.offering = createFakeEducationProgramOffering();
      // Create fake application that must be returned.
      const fakeApplication = createFakeApplicationInAssessment(testStudent);
      fakeApplication.studentAssessments = [originalAssessment];
      fakeApplication.currentAssessment = originalAssessment;
      fakeApplication.msfaaNumber = testMSFAANumber;
      fakeApplication.applicationStatus = ApplicationStatus.completed;
      const testApplication = await applicationRepository.save(fakeApplication);
      // Create a fake application with an offering end data older than the previous one.
      // While querying the database the testApplication must be retrieve instead of this one.
      const olderFakeApplication = createFakeApplication();
      olderFakeApplication.msfaaNumber = testMSFAANumber;
      olderFakeApplication.applicationStatus = ApplicationStatus.completed;
      // Save older fake application.
      const olderApplication = await applicationRepository.save(
        olderFakeApplication,
      );

      try {
        const previouslySignedApplication =
          await applicationService.getPreviouslySignedApplication(
            testStudent.id,
            olderApplication.currentAssessment.offering.offeringIntensity,
          );
        expect(previouslySignedApplication).toBeTruthy();
        expect(previouslySignedApplication.id).toBe(testApplication.id);
        expect(previouslySignedApplication.msfaaNumber.id).toBe(
          testMSFAANumber.id,
        );
      } finally {
        await applicationRepository.remove(testApplication);
        await applicationRepository.remove(olderFakeApplication);
        await msfaaNumberRepository.remove(testMSFAANumber);
        await studentRepository.remove(testStudent);
      }
    });
  });
});
