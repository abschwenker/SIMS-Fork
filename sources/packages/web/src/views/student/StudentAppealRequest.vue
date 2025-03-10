<template>
  <student-page-container>
    <template #header>
      <header-navigator title="Student" subTitle="Request a Change" />
    </template>

    <div v-if="showRequestForAppeal">
      <!-- Content area. -->
      <formio-container
        formName="studentRequestChange"
        @submitted="submitRequest"
      >
        <template #actions="{ submit }">
          <v-btn @click="submit" color="primary" class="float-right">
            Next
          </v-btn>
        </template>
      </formio-container>
    </div>
    <div v-else>
      <body-header
        title="Fill in the field(s) below"
        subTitle="StudentAid BC will review your application change after you submit the fields below."
      ></body-header>
      <appeal-requests-form
        :student-appeal-requests="appealRequestsForms"
        @submitted="submitAppeal"
      >
        <template #actions="{ submit }">
          <v-btn
            color="primary"
            variant="outlined"
            class="mr-2"
            @click="backToRequestForm"
            >Back
          </v-btn>

          <v-btn color="primary" class="ml-2 float-right" @click="submit"
            >Submit for review</v-btn
          >
        </template>
      </appeal-requests-form>
    </div>
  </student-page-container>
</template>
<script lang="ts">
import { computed, ref, defineComponent } from "vue";
import { ApiProcessError, FormIOForm, StudentAppealRequest } from "@/types";
import { ApplicationService } from "@/services/ApplicationService";
import { StudentAppealService } from "@/services/StudentAppealService";
import AppealRequestsForm from "@/components/common/AppealRequestsForm.vue";
import { useSnackBar } from "@/composables";
import {
  APPLICATION_CHANGE_NOT_ELIGIBLE,
  INVALID_APPLICATION_NUMBER,
} from "@/constants";

// Model for student request change form.
interface StudentRequestSelectedForms {
  applicationNumber: string;
  formNames: string[];
}

export default defineComponent({
  components: {
    AppealRequestsForm,
  },
  setup() {
    const snackBar = useSnackBar();
    const appealRequestsForms = ref([] as StudentAppealRequest[]);
    let applicationId: number;
    const showRequestForAppeal = computed(
      () => appealRequestsForms.value.length === 0,
    );

    const submitRequest = async (
      form: FormIOForm<StudentRequestSelectedForms>,
    ) => {
      try {
        const application =
          await ApplicationService.shared.getApplicationForRequestChange(
            form.data.applicationNumber,
          );
        applicationId = application.id;
        appealRequestsForms.value = form.data.formNames.map(
          (formName) => ({ formName } as StudentAppealRequest),
        );
      } catch (error) {
        const errorMessage = "An error happened while requesting a change.";
        const errorLabel = "Unexpected error";
        if (error.response.data?.errorType === INVALID_APPLICATION_NUMBER) {
          snackBar.warn(
            `Application not found. ${error.response.data.message}`,
          );
        } else {
          snackBar.error(`${errorLabel}. ${errorMessage}`);
        }
      }
    };

    const backToRequestForm = () => {
      appealRequestsForms.value = [];
    };

    const submitAppeal = async (appealRequests: StudentAppealRequest[]) => {
      try {
        await StudentAppealService.shared.submitStudentAppeal(
          applicationId,
          appealRequests,
        );
        snackBar.success(
          "The request for change has been submitted successfully.",
        );
        //TODO: Redirect to appeal view page once it is developed.
        backToRequestForm();
      } catch (error: unknown) {
        if (error instanceof ApiProcessError) {
          if (
            [
              INVALID_APPLICATION_NUMBER,
              APPLICATION_CHANGE_NOT_ELIGIBLE,
            ].includes(error.errorType)
          ) {
            snackBar.warn(`Not able to submit. ${error.message}`);
            return;
          }
        }
        snackBar.error("An unexpected error happened during the submission.");
      }
    };

    return {
      submitRequest,
      appealRequestsForms,
      showRequestForAppeal,
      backToRequestForm,
      submitAppeal,
    };
  },
});
</script>
