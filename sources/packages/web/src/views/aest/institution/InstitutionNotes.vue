<template>
  <div class="mt-9">
    <body-header title="Notes">
      <template #actions>
        <v-btn-toggle
          v-model="toggleNotes"
          mandatory
          class="float-right btn-toggle"
          selected-class="selected-btn-toggle"
        >
          <v-btn
            rounded="xl"
            color="primary"
            data-cy="allNotesButton"
            @click="filterNotes()"
            value="allNotes"
            >All Notes</v-btn
          >
          <v-btn
            rounded="xl"
            v-for="item in InstitutionNoteType"
            :key="item"
            color="primary"
            :value="item"
            :data-cy="item"
            class="ml-2"
            @click="filterNotes(item)"
            >{{ item }}</v-btn
          >
        </v-btn-toggle></template
      >
    </body-header>
    <notes
      title="Past Notes"
      :entityType="NoteEntityType.Institution"
      :notes="notes"
      @submitData="addNote"
      :allowedRole="Role.InstitutionCreateNote"
    ></notes>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";
import Notes from "@/components/common/notes/Notes.vue";
import { NoteService } from "@/services/NoteService";
import { useFormatters, useSnackBar } from "@/composables";
import {
  InstitutionNoteType,
  NoteEntityType,
  LayoutTemplates,
  Role,
} from "@/types";
import { NoteAPIInDTO } from "@/services/http/dto";

export default {
  components: { Notes },
  props: {
    institutionId: {
      type: Number,
      required: true,
    },
  },
  setup(props: any) {
    const toggleNotes = ref("allNotes");
    const notes = ref();
    const filteredNoteType = ref();
    const { dateOnlyLongString } = useFormatters();
    const snackBar = useSnackBar();

    const filterNotes = async (noteType?: InstitutionNoteType) => {
      filteredNoteType.value = noteType;
      notes.value = await NoteService.shared.getInstitutionNotes(
        props.institutionId,
        filteredNoteType.value,
      );
    };

    const addNote = async (data: NoteAPIInDTO) => {
      try {
        await NoteService.shared.addInstitutionNote(props.institutionId, data);
        await filterNotes(filteredNoteType.value);
        snackBar.success("The note has been added to the institution.");
      } catch (error) {
        snackBar.error("Unexpected error while adding the note.");
      }
    };

    onMounted(async () => {
      await filterNotes();
    });

    return {
      notes,
      dateOnlyLongString,
      InstitutionNoteType,
      filterNotes,
      filteredNoteType,
      addNote,
      NoteEntityType,
      LayoutTemplates,
      toggleNotes,
      Role,
    };
  },
};
</script>
