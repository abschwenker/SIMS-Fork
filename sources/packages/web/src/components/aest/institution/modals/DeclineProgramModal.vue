<template>
  <v-form ref="declineProgramForm">
    <modal-dialog-base title="Decline program" :showDialog="showDialog">
      <template #content>
        <error-summary :errors="declineProgramForm.errors" />
        <div class="pb-2">
          <span class="label-value"
            >Outline the reasoning for declining this program. This will be
            stored in the institution profile notes.</span
          >
        </div>
        <v-textarea
          label="Notes"
          placeholder="Long text..."
          v-model="formModel.declinedNote"
          variant="outlined"
          :rules="[checkNotesLengthRule]"
      /></template>
      <template #footer>
        <check-permission-role :role="Role.InstitutionApproveDeclineProgram">
          <template #="{ notAllowed }">
            <footer-buttons
              :processing="processing"
              primaryLabel="Decline now"
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
import ErrorSummary from "@/components/generic/ErrorSummary.vue";
import { useModalDialog, useRules } from "@/composables";
import { DeclineProgramAPIInDTO } from "@/services/http/dto";
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
    const { checkNotesLengthRule } = useRules();
    const { showDialog, showModal, resolvePromise } = useModalDialog<
      DeclineProgramAPIInDTO | false
    >();
    const declineProgramForm = ref({} as VForm);
    const formModel = reactive({
      declinedNote: "",
    } as DeclineProgramAPIInDTO);

    const submit = async () => {
      const validationResult = await declineProgramForm.value.validate();
      if (!validationResult.valid) {
        return;
      }
      resolvePromise(formModel);
    };

    const cancel = () => {
      declineProgramForm.value.reset();
      declineProgramForm.value.resetValidation();
      resolvePromise(false);
    };

    return {
      showDialog,
      submit,
      cancel,
      showModal,
      formModel,
      declineProgramForm,
      Role,
      checkNotesLengthRule,
    };
  },
};
</script>
