<template>
  <student-page-container>
    <template #header>
      <header-navigator
        title="Applications"
        subTitle="Financial Aid Application"
      >
        <template #buttons>
          <v-btn
            color="primary"
            v-if="!notDraft && !isFirstPage && !submittingApplication"
            variant="outlined"
            :loading="savingDraft"
            @click="saveDraft()"
          >
            {{ savingDraft ? "Saving..." : "Save draft" }}</v-btn
          >
          <v-btn
            v-if="!isReadOnly && !isFirstPage"
            class="ml-2"
            :disabled="submittingApplication"
            color="primary"
            @click="wizardSubmit()"
            :loading="submittingApplication"
          >
            {{ submittingApplication ? "Submitting..." : "Submit application" }}
          </v-btn>
        </template>
      </header-navigator>
    </template>
    <StudentApplication
      :selectedForm="selectedForm"
      :initialData="initialData"
      :isReadOnly="isReadOnly"
      :programYearId="programYearId"
      @formLoadedCallback="loadForm"
      @submitApplication="submitApplication"
      @customEventCallback="customEventCallback"
      @pageChanged="pageChanged"
      :processing="submittingApplication"
    />
  </student-page-container>
  <ConfirmEditApplication
    ref="editApplicationModal"
    @confirmEditApplication="editApplication"
  />
</template>

<script lang="ts">
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { StudentService } from "@/services/StudentService";
import { ApplicationService } from "@/services/ApplicationService";
import {
  useFormioUtils,
  useSnackBar,
  ModalDialog,
  useFormatters,
} from "@/composables";
import {
  FormIOCustomEvent,
  FormIOCustomEventTypes,
  ApplicationStatus,
  GetApplicationDataDto,
  ApiProcessError,
} from "@/types";
import { StudentRoutesConst } from "@/constants/routes/RouteConstants";
import ConfirmEditApplication from "@/components/students/modals/ConfirmEditApplication.vue";
import {
  PIR_OR_DATE_OVERLAP_ERROR,
  ACTIVE_STUDENT_RESTRICTION,
} from "@/constants";
import StudentApplication from "@/components/common/StudentApplication.vue";

export default {
  components: {
    StudentApplication,
    ConfirmEditApplication,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    selectedForm: {
      type: String,
      required: true,
    },
    readOnly: {
      type: String,
    },
    programYearId: {
      type: Number,
      required: true,
    },
  },
  setup(props: any) {
    const formatter = useFormatters();
    const router = useRouter();
    const initialData = ref({});
    const formioUtils = useFormioUtils();
    const snackBar = useSnackBar();
    const savingDraft = ref(false);
    const submittingApplication = ref(false);
    let applicationWizard: any;
    const isFirstPage = ref(true);
    const isLastPage = ref(false);
    const isReadOnly = ref(false);
    const notDraft = ref(false);
    const existingApplication = ref({} as GetApplicationDataDto);
    const editApplicationModal = ref({} as ModalDialog<boolean>);

    const checkProgramYear = async () => {
      // check program year, if not active allow only readonly mode with a snackBar
      const programYearDetails =
        await ApplicationService.shared.getApplicationWithPY(props.id, true);
      if (!programYearDetails.active) {
        isReadOnly.value = true;
        snackBar.error(
          "This application can no longer be edited or submitted",
          snackBar.EXTENDED_MESSAGE_DISPLAY_TIME,
        );
      }
    };

    onMounted(async () => {
      await checkProgramYear();
      //Get the student information, application information and student restriction.
      const [studentInfo, applicationData] = await Promise.all([
        StudentService.shared.getStudentProfile(),
        ApplicationService.shared.getApplicationData(props.id),
      ]);

      // Adjust the spaces when optional fields are not present.
      isReadOnly.value =
        [
          ApplicationStatus.completed,
          ApplicationStatus.cancelled,
          ApplicationStatus.overwritten,
        ].includes(applicationData.applicationStatus) || !!props.readOnly;

      notDraft.value =
        !!props.readOnly ||
        ![ApplicationStatus.draft].includes(applicationData.applicationStatus);

      const address = studentInfo.contact;

      const formattedAddress = formatter.getFormattedAddress(address.address);
      const studentFormData = {
        studentGivenNames: studentInfo.firstName,
        studentLastName: studentInfo.lastName,
        studentGender: studentInfo.gender,
        studentDateOfBirth: studentInfo.birthDateFormatted,
        studentPhoneNumber: studentInfo.contact.phone,
        studentHomeAddress: formattedAddress,
        studentEmail: studentInfo.email,
        pdStatus: studentInfo.pdStatus,
      };
      const programYear = {
        programYearStartDate: applicationData.programYearStartDate,
        programYearEndDate: applicationData.programYearEndDate,
      };
      initialData.value = {
        ...applicationData.data,
        ...studentFormData,
        ...programYear,
        isReadOnly: isReadOnly.value,
      };
      existingApplication.value = applicationData;
    });

    // Save the current state of the student application skipping all validations.
    const saveDraft = async () => {
      savingDraft.value = true;
      try {
        const associatedFiles =
          formioUtils.getAssociatedFiles(applicationWizard);
        await ApplicationService.shared.saveApplicationDraft(props.id, {
          programYearId: props.programYearId,
          data: applicationWizard.submission.data,
          associatedFiles,
        });
        snackBar.success("Application draft saved with success.");
      } catch (error) {
        snackBar.error("An unexpected error happen.");
      } finally {
        savingDraft.value = false;
      }
    };

    // Execute the final submission of the student application.
    const submitApplication = async (args: any, form: any) => {
      submittingApplication.value = true;
      try {
        const associatedFiles = formioUtils.getAssociatedFiles(form);
        await ApplicationService.shared.submitApplication(props.id, {
          programYearId: props.programYearId,
          data: args,
          associatedFiles,
        });
        router.push({
          name: StudentRoutesConst.STUDENT_APPLICATION_SUMMARY,
        });
        snackBar.success("Thank you, your application has been submitted.");
      } catch (error: unknown) {
        let errorLabel = "Unexpected error!";
        let errorMsg = "An unexpected error happen.";
        if (error instanceof ApiProcessError) {
          switch (error.errorType) {
            case PIR_OR_DATE_OVERLAP_ERROR:
              errorLabel = "Invalid submission";
              errorMsg = error.message;
              break;
            case ACTIVE_STUDENT_RESTRICTION:
              errorLabel = "Active restriction!";
              errorMsg = error.message;
              break;
          }
        }
        snackBar.error(`${errorLabel}. ${errorMsg}`);
      } finally {
        submittingApplication.value = false;
      }
    };

    const editApplication = () => {
      applicationWizard.submit();
    };

    const loadForm = async (form: any) => {
      applicationWizard = form;
    };

    const pageChanged = (
      isInFirstPage: boolean,
      currentPage: number,
      isInLastPage: boolean,
    ) => {
      isFirstPage.value = isInFirstPage;
      isLastPage.value = isInLastPage;
    };

    const customEventCallback = async (form: any, event: FormIOCustomEvent) => {
      if (FormIOCustomEventTypes.RouteToStudentProfile === event.type) {
        router.push({
          name: StudentRoutesConst.STUDENT_PROFILE_EDIT,
        });
      }
    };

    const confirmEditApplication = async () => {
      if (await editApplicationModal.value.showModal()) {
        editApplication();
      }
    };

    const wizardSubmit = () => {
      if (
        existingApplication.value.applicationStatus !== ApplicationStatus.draft
      ) {
        confirmEditApplication();
      } else {
        applicationWizard.submit();
      }
    };
    return {
      initialData,
      loadForm,
      wizardSubmit,
      saveDraft,
      submitApplication,
      savingDraft,
      submittingApplication,
      customEventCallback,
      isReadOnly,
      notDraft,
      confirmEditApplication,
      editApplication,
      editApplicationModal,
      pageChanged,
      isFirstPage,
      isLastPage,
    };
  },
};
</script>
