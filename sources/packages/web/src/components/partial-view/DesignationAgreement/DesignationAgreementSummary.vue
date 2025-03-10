<template>
  <content-group>
    <toggle-content :toggled="!designations.length" :message="toggleMessage">
      <DataTable
        :value="designations"
        :paginator="true"
        :rows="DEFAULT_PAGE_LIMIT"
        :rowsPerPageOptions="PAGINATION_LIST"
        :totalRecords="designations.length"
      >
        <Column header="Date submitted"
          ><template #body="slotProps">
            <span>{{ dateOnlyLongString(slotProps.data.submittedDate) }}</span>
          </template>
        </Column>
        <Column header="Start date"
          ><template #body="slotProps">
            <span>{{ dateOnlyLongString(slotProps.data.startDate) }}</span>
          </template>
        </Column>
        <Column header="Expiry date"
          ><template #body="slotProps">
            <span>{{ dateOnlyLongString(slotProps.data.endDate) }}</span>
          </template>
        </Column>
        <Column header="Status"
          ><template #body="slotProps">
            <status-chip-designation
              :status="slotProps.data.designationStatus"
            /> </template
        ></Column>
        <Column header="Action">
          <template #body="slotProps">
            <v-btn
              color="primary"
              data-cy="viewDesignation"
              @click="goToViewDesignation(slotProps.data.designationId)"
            >
              View
            </v-btn>
          </template>
        </Column>
      </DataTable>
    </toggle-content>
  </content-group>
</template>

<script lang="ts">
import {
  DEFAULT_PAGE_LIMIT,
  DEFAULT_PAGE_NUMBER,
  PAGINATION_LIST,
} from "@/types";
import { useFormatters, useInstitutionAuth } from "@/composables";
import ToggleContent from "@/components/generic/ToggleContent.vue";
import StatusChipDesignation from "@/components/generic/StatusChipDesignation.vue";
import { SetupContext } from "vue";

export default {
  emits: ["viewDesignation"],
  components: {
    ToggleContent,
    StatusChipDesignation,
  },
  props: {
    designations: {
      type: Object,
      required: true,
    },
    toggleMessage: {
      type: String,
      required: true,
    },
  },
  setup(props: any, context: SetupContext) {
    const { isLegalSigningAuthority } = useInstitutionAuth();
    const { dateOnlyLongString } = useFormatters();

    const goToViewDesignation = (id: number) => {
      context.emit("viewDesignation", id);
    };

    return {
      goToViewDesignation,
      isLegalSigningAuthority,
      dateOnlyLongString,
      DEFAULT_PAGE_LIMIT,
      DEFAULT_PAGE_NUMBER,
      PAGINATION_LIST,
    };
  },
};
</script>
