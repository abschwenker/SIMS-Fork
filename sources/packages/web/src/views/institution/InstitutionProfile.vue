<template>
  <full-page-container>
    <template #header>
      <header-navigator
        title="Manage institution"
        data-cy="manageProfileHeader"
        subTitle="Manage Profile"
      />
    </template>
    <template #alerts>
      <banner
        :type="BannerTypes.Info"
        header="How to update information"
        summary="Please send us an email to request a change. For your institution's mailing address, you can update it without emailing a request."
      >
        <template #actions>
          <v-btn color="info">Email designat@gov.bc.ca</v-btn>
        </template>
      </banner>
    </template>
    <institution-profile-form
      :profileData="institutionProfileModel"
      @submitInstitutionProfile="updateInstitution"
    ></institution-profile-form>
  </full-page-container>
</template>

<script lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { InstitutionService } from "@/services/InstitutionService";
import {
  InstitutionDetailAPIOutDTO,
  InstitutionContactAPIInDTO,
} from "@/services/http/dto";
import { InstitutionRoutesConst } from "@/constants/routes/RouteConstants";
import { useSnackBar } from "@/composables";
import { useStore } from "vuex";
import InstitutionProfileForm from "@/components/institutions/profile/InstitutionProfileForm.vue";
import { BannerTypes } from "@/types";

export default {
  components: { InstitutionProfileForm },
  setup() {
    // Hooks
    const store = useStore();
    const snackBar = useSnackBar();
    const router = useRouter();
    // Data-bind
    const institutionProfileModel = ref({} as InstitutionDetailAPIOutDTO);

    const updateInstitution = async (data: InstitutionContactAPIInDTO) => {
      try {
        await InstitutionService.shared.updateInstitution(data);
        snackBar.success("Institution successfully updated!");
        await store.dispatch("institution/getInstitutionDetails");
        router.push({
          name: InstitutionRoutesConst.INSTITUTION_DASHBOARD,
        });
      } catch (error) {
        snackBar.error("Unexpected error while updating the institution.");
      }
    };

    // Hooks
    onMounted(async () => {
      institutionProfileModel.value =
        await InstitutionService.shared.getDetail();
    });

    return {
      institutionProfileModel,
      updateInstitution,
      BannerTypes,
    };
  },
};
</script>
