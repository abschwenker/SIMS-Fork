<template>
  <v-form ref="addNewNoteForm">
    <modal-dialog-base title="Create new note" :showDialog="showDialog">
      <template #content>
        <error-summary :errors="addNewNoteForm.errors" />
        <div class="pb-2">
          <span class="label-value"
            >Add a note with relevant decisions or actions taken on this
            account.</span
          >
        </div>
        <!-- TODO add placeholder for v-select when we have stable vuetify 3.-->
        <v-select
          label="Note type"
          density="compact"
          :items="noteTypeItems"
          v-model="formModel.noteType"
          variant="outlined"
          :rules="[(v) => checkNullOrEmptyRule(v, 'Note type')]" />
        <v-textarea
          label="Note body"
          placeholder="Long text..."
          v-model="formModel.description"
          variant="outlined"
          :rules="[checkNotesLengthRule]"
      /></template>
      <template #footer>
        <check-permission-role :role="allowedRole">
          <template #="{ notAllowed }">
            <footer-buttons
              primaryLabel="Add note"
              @secondaryClick="cancel"
              @primaryClick="submit"
              :disablePrimaryButton="notAllowed"
            />
          </template>
        </check-permission-role>
      </template>
    </modal-dialog-base>
  </v-form>
</template>

<script lang="ts">
import { PropType, ref, reactive, onMounted, defineComponent } from "vue";
import ModalDialogBase from "@/components/generic/ModalDialogBase.vue";
import ErrorSummary from "@/components/generic/ErrorSummary.vue";
import { useModalDialog, useRules } from "@/composables";
import {
  Role,
  VForm,
  InstitutionNoteType,
  StudentNoteType,
  NoteEntityType,
  SelectItemType,
} from "@/types";
import CheckPermissionRole from "@/components/generic/CheckPermissionRole.vue";
import { NoteAPIInDTO } from "@/services/http/dto";

export default defineComponent({
  components: { ModalDialogBase, CheckPermissionRole, ErrorSummary },
  props: {
    entityType: {
      type: String,
      required: true,
    },
    allowedRole: {
      type: String as PropType<Role>,
      required: true,
    },
  },
  setup(props) {
    const { checkNotesLengthRule, checkNullOrEmptyRule } = useRules();
    const { showDialog, showModal, resolvePromise } = useModalDialog<
      NoteAPIInDTO | boolean
    >();
    const addNewNoteForm = ref({} as VForm);
    const formModel = reactive({} as NoteAPIInDTO);
    const noteTypeItems = ref([] as SelectItemType[]);

    onMounted(async () => {
      if (props.entityType === NoteEntityType.Institution) {
        noteTypeItems.value = convertToSelectItemType(InstitutionNoteType);
      }
      if (props.entityType === NoteEntityType.Student) {
        noteTypeItems.value = convertToSelectItemType(StudentNoteType);
      }
    });

    const convertToSelectItemType = (
      type: Record<string, string | number>,
    ): SelectItemType[] => {
      const selectItemsArray: SelectItemType[] = [];
      for (const selectItem in type) {
        selectItemsArray.push({
          title: selectItem,
          value: type[selectItem],
        });
      }
      return selectItemsArray;
    };

    const submit = async () => {
      const validationResult = await addNewNoteForm.value.validate();
      if (!validationResult.valid) {
        return;
      }
      // Copying the payload, as reset is making the formModel properties null.
      const payload = { ...formModel };
      resolvePromise(payload);
      addNewNoteForm.value.reset();
    };

    const cancel = () => {
      addNewNoteForm.value.reset();
      addNewNoteForm.value.resetValidation();
      resolvePromise(false);
    };

    return {
      showDialog,
      showModal,
      formModel,
      Role,
      submit,
      cancel,
      addNewNoteForm,
      noteTypeItems,
      checkNotesLengthRule,
      checkNullOrEmptyRule,
    };
  },
});
</script>
