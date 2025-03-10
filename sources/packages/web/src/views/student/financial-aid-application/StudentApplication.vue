<template>
  <student-page-container>
    <template #header>
      <header-navigator
        title="Applications"
        subTitle="Start New Application"
        :routeLocation="{
          name: StudentRoutesConst.STUDENT_APPLICATION_SUMMARY,
        }"
      >
      </header-navigator>
    </template>
    <v-form ref="startApplicationForm">
      <h2 class="category-header-large primary-color pb-4">
        Apply for funding
      </h2>
      <content-group>
        <p class="category-header-medium-small pa-2">
          Financial Aid Application
        </p>
        <p class="px-2">
          Apply to see if you are applicable for provincial or federal loans and
          grant. This is for students attending full-time or part-time
          post-secondary studies.
        </p>
        <v-select
          v-model="programYearId"
          :items="programYearOptions"
          variant="outlined"
          density="compact"
          label="Select program year"
          class="px-2 pb-4"
          :rules="[(v) => checkNullOrEmptyRule(v, 'Year')]"
          hide-details="auto"
        ></v-select>
        <v-btn
          class="ma-2"
          variant="elevated"
          data-cy="primaryFooterButton"
          color="primary"
          @click="startApplication"
          >Start Application</v-btn
        >
      </content-group>
    </v-form>
  </student-page-container>
  <confirm-modal
    title="Application already in progress"
    text="There is already a draft of an application in progress. Please continue
        with your draft application or cancel it and start a new application."
    :showSecondaryButton="false"
    ok-label="Close"
    ref="draftApplicationModal"
  >
  </confirm-modal>
</template>
<script lang="ts">
import { onMounted, ref, defineComponent } from "vue";
import ConfirmModal from "@/components/common/modals/ConfirmModal.vue";
import { useSnackBar, useRules, ModalDialog } from "@/composables";
import { useRouter } from "vue-router";
import { VForm, SelectItemType, LayoutTemplates } from "@/types";
import { ApplicationService } from "@/services/ApplicationService";
import { StudentRoutesConst } from "@/constants/routes/RouteConstants";
import { ProgramYearService } from "@/services/ProgramYearService";
import ContentGroup from "@/components/generic/ContentGroup.vue";

export default defineComponent({
  components: { ConfirmModal, ContentGroup },
  setup() {
    const initialData = ref({});
    const router = useRouter();
    const snackBar = useSnackBar();
    const programYearOptions = ref([] as SelectItemType[]);
    const programYearId = ref();
    const startApplicationForm = ref({} as VForm);
    const { checkNullOrEmptyRule } = useRules();
    const draftApplicationModal = ref({} as ModalDialog<boolean>);

    onMounted(async () => {
      programYearOptions.value = (
        await ProgramYearService.shared.getProgramYearOptions()
      ).map((yearOption) => ({
        title: yearOption.description,
        value: yearOption.id.toString(),
      }));
    });

    const startApplication = async () => {
      try {
        const validationResult = await startApplicationForm.value.validate();
        if (!validationResult.valid) {
          return;
        }
        if (programYearId.value) {
          const createDraftResult =
            await ApplicationService.shared.createApplicationDraft({
              programYearId: programYearId.value,
              data: {},
              associatedFiles: [],
            });
          if (createDraftResult.draftAlreadyExists) {
            await draftApplicationModal.value.showModal();
            return;
          }
          const programYear =
            await ProgramYearService.shared.getActiveProgramYear(
              programYearId.value,
            );
          if (programYear) {
            router.push({
              name: StudentRoutesConst.DYNAMIC_FINANCIAL_APP_FORM,
              params: {
                selectedForm: programYear.formName,
                programYearId: programYearId.value,
                id: createDraftResult.draftId,
              },
            });
          }
        }
      } catch (error) {
        snackBar.error(
          "An error happened while trying to start a new application.",
        );
      }
    };

    return {
      initialData,
      StudentRoutesConst,
      programYearOptions,
      programYearId,
      startApplication,
      startApplicationForm,
      checkNullOrEmptyRule,
      LayoutTemplates,
      draftApplicationModal,
    };
  },
});
</script>
