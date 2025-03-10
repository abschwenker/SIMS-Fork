<template>
  <full-page-container>
    <template #header>
      <header-navigator
        title="Study period offerings"
        :routeLocation="programRoute"
        subTitle="View Request"
      >
        <template #buttons v-if="showActionButtons">
          <v-row class="m-0 p-0">
            <check-permission-role
              :role="Role.InstitutionApproveDeclineOffering"
            >
              <template #="{ notAllowed }">
                <v-btn
                  variant="outlined"
                  :disabled="notAllowed"
                  color="primary"
                  @click="assessOffering(OfferingStatus.CreationDeclined)"
                  >Decline</v-btn
                >
                <v-btn
                  class="ml-2"
                  color="primary"
                  :disabled="notAllowed"
                  @click="assessOffering(OfferingStatus.Approved)"
                  >Approve offering</v-btn
                >
              </template>
            </check-permission-role>
          </v-row>
        </template>
      </header-navigator>
      <program-offering-detail-header
        class="m-4"
        :headerDetails="{
          ...initialData,
          status: initialData.offeringStatus,
          institutionId: institutionId,
        }"
      />
    </template>
    <offering-form :data="initialData"></offering-form>
    <assess-offering-modal
      ref="assessOfferingModalRef"
      :offeringStatus="offeringApprovalStatus"
    />
  </full-page-container>
</template>

<script lang="ts">
import { EducationProgramOfferingService } from "@/services/EducationProgramOfferingService";
import { onMounted, ref, computed } from "vue";
import { OfferingStatus, Role } from "@/types";
import { AESTRoutesConst } from "@/constants/routes/RouteConstants";
import { useSnackBar, ModalDialog } from "@/composables";
import {
  EducationProgramOfferingAPIOutDTO,
  OfferingAssessmentAPIInDTO,
} from "@/services/http/dto";
import { BannerTypes } from "@/types/contracts/Banner";
import ProgramOfferingDetailHeader from "@/components/common/ProgramOfferingDetailHeader.vue";
import OfferingForm from "@/components/common/OfferingForm.vue";
import AssessOfferingModal from "@/components/aest/institution/modals/AssessOfferingModal.vue";
import CheckPermissionRole from "@/components/generic/CheckPermissionRole.vue";

export default {
  components: {
    ProgramOfferingDetailHeader,
    OfferingForm,
    AssessOfferingModal,
    CheckPermissionRole,
  },
  props: {
    institutionId: {
      type: Number,
      required: true,
    },
    locationId: {
      type: Number,
      required: true,
    },
    programId: {
      type: Number,
      required: true,
    },
    offeringId: {
      type: Number,
      required: true,
    },
  },
  setup(props: any) {
    const snackBar = useSnackBar();
    const initialData = ref({} as EducationProgramOfferingAPIOutDTO);
    const assessOfferingModalRef = ref(
      {} as ModalDialog<OfferingAssessmentAPIInDTO | boolean>,
    );
    const offeringApprovalStatus = ref(OfferingStatus.CreationDeclined);
    const programRoute = computed(() => ({
      name: AESTRoutesConst.PROGRAM_DETAILS,
      params: {
        programId: props.programId,
        institutionId: props.institutionId,
        locationId: props.locationId,
      },
    }));
    const showActionButtons = computed(
      () => initialData.value.offeringStatus === OfferingStatus.CreationPending,
    );
    const loadFormData = async () => {
      initialData.value =
        await EducationProgramOfferingService.shared.getOfferingDetails(
          props.offeringId,
        );
    };

    const assessOffering = async (offeringStatus: OfferingStatus) => {
      offeringApprovalStatus.value = offeringStatus;
      const responseData = await assessOfferingModalRef.value.showModal();
      if (responseData) {
        try {
          await EducationProgramOfferingService.shared.assessOffering(
            props.offeringId,
            responseData as OfferingAssessmentAPIInDTO,
          );
          snackBar.success(
            `The given offering has been ${offeringStatus.toLowerCase()} and notes added.`,
          );
          await loadFormData();
        } catch {
          snackBar.error(
            "Unexpected error while approving/declining the offering.",
          );
        }
      }
    };
    onMounted(async () => {
      await loadFormData();
    });
    return {
      initialData,
      OfferingStatus,
      BannerTypes,
      AESTRoutesConst,
      assessOffering,
      assessOfferingModalRef,
      programRoute,
      showActionButtons,
      offeringApprovalStatus,
      Role,
    };
  },
};
</script>
