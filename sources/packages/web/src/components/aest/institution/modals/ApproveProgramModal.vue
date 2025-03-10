<template>
  <v-form ref="approveProgramForm">
    <modal-dialog-base title="Approve program" :showDialog="showDialog">
      <template #content>
        <error-summary :errors="approveProgramForm.errors" />
        <div class="pb-2">
          <span class="label-value"
            >Outline the reasoning for approving this program. This will be
            stored in the institution profile notes.</span
          >
        </div>
        <!-- TODO Date picker is not available in the vuetify 3 version, so temporary usage of textfield and regex-->
        <v-text-field
          label="Effective end date"
          class="mt-2"
          type="date"
          v-model="formModel.effectiveEndDate"
          variant="outlined"
          :rules="[checkStringDateFormatRule]"
        />
        <v-textarea
          label="Notes"
          placeholder="Long text..."
          v-model="formModel.approvedNote"
          variant="outlined"
          :rules="[checkNotesLengthRule]"
        />
      </template>
      <template #footer>
        <check-permission-role :role="Role.InstitutionApproveDeclineProgram">
          <template #="{ notAllowed }">
            <footer-buttons
              :processing="processing"
              primaryLabel="Approve now"
              @primaryClick="submit"
              @secondaryClick="cancel"
              :disablePrimaryButton="notAllowed"
            />
          </template>
        </check-permission-role>
      </template>
    </modal-dialog-base>
  </v-form>
</template>

<script lang="ts">
import { ref, reactive } from "vue";
import ModalDialogBase from "@/components/generic/ModalDialogBase.vue";
import { useModalDialog, useRules } from "@/composables";
import ErrorSummary from "@/components/generic/ErrorSummary.vue";
import { ApproveProgramAPIInDTO } from "@/services/http/dto";
import CheckPermissionRole from "@/components/generic/CheckPermissionRole.vue";
import { Role, VForm } from "@/types";

export default {
  components: {
    ModalDialogBase,
    CheckPermissionRole,
    ErrorSummary,
  },
  props: {
    processing: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  setup() {
    const { checkNotesLengthRule, checkStringDateFormatRule } = useRules();
    const { showDialog, showModal, resolvePromise } = useModalDialog<
      ApproveProgramAPIInDTO | boolean
    >();
    const approveProgramForm = ref({} as VForm);
    const formModel = reactive({
      effectiveEndDate: "",
      approvedNote: "",
    } as ApproveProgramAPIInDTO);

    const submit = async () => {
      const validationResult = await approveProgramForm.value.validate();
      if (!validationResult.valid) {
        return;
      }
      resolvePromise(formModel);
    };

    // Closed the modal dialog.
    const cancel = () => {
      approveProgramForm.value.reset();
      approveProgramForm.value.resetValidation();
      resolvePromise(false);
    };

    return {
      showDialog,
      submit,
      showModal,
      cancel,
      formModel,
      approveProgramForm,
      Role,
      checkNotesLengthRule,
      checkStringDateFormatRule,
    };
  },
};
</script>
