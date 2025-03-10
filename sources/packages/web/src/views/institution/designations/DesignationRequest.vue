<template>
  <full-page-container :full-width="true">
    <template #header>
      <header-navigator
        title="Manage designations"
        :routeLocation="goBackRouteParams"
        subTitle="Request Designation"
        data-cy="manageDesignationHeader"
      />
    </template>
    <designation-agreement-form
      :model="designationModel"
      @submitDesignation="submitDesignation"
      @cancel="goBack"
      :processing="processing"
    ></designation-agreement-form>
  </full-page-container>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";
import { InstitutionService } from "@/services/InstitutionService";
import {
  useFormatters,
  useInstitutionAuth,
  useInstitutionState,
  useSnackBar,
} from "@/composables";
import { RouteLocationRaw, useRouter } from "vue-router";
import DesignationAgreementForm from "@/components/partial-view/DesignationAgreement/DesignationAgreementForm.vue";
import {
  DesignationModel,
  DesignationFormViewModes,
  DesignationLocationsListItem,
} from "@/components/partial-view/DesignationAgreement/DesignationAgreementForm.models";
import { DesignationAgreementService } from "@/services/DesignationAgreementService";
import { SubmitDesignationAgreementDto } from "@/types/contracts/DesignationAgreementContract";
import { InstitutionRoutesConst } from "@/constants/routes/RouteConstants";
import { FormIOForm } from "@/types";

export default {
  components: { DesignationAgreementForm },
  setup() {
    const processing = ref(false);
    const router = useRouter();
    const goBackRouteParams = {
      name: InstitutionRoutesConst.MANAGE_DESIGNATION,
    } as RouteLocationRaw;

    const snackBar = useSnackBar();
    const formatter = useFormatters();
    const { institutionState } = useInstitutionState();
    const { userFullName, userEmail, isLegalSigningAuthority } =
      useInstitutionAuth();
    const designationModel = ref({} as DesignationModel);

    onMounted(async () => {
      const locations =
        await InstitutionService.shared.getAllInstitutionLocations();

      const designationModelLocations = locations.map(
        (location) =>
          ({
            locationId: location.id,
            locationName: location.name,
            locationAddress: formatter.getFormattedAddress(
              location.data.address,
            ),
            requestForDesignation: false,
          } as DesignationLocationsListItem),
      );

      designationModel.value = {
        institutionName: institutionState.value.legalOperatingName,
        institutionType: institutionState.value.institutionType,
        isBCPrivate: institutionState.value.isBCPrivate,
        viewMode: DesignationFormViewModes.submission,
        locations: designationModelLocations,
      };

      if (isLegalSigningAuthority) {
        // Only populates the signing officer data
        // if the current user is has the proper role.
        designationModel.value.dynamicData = {
          legalAuthorityName: userFullName.value,
          legalAuthorityEmailAddress: userEmail.value,
        };
      }
    });

    const goBack = () => {
      router.push(goBackRouteParams);
    };

    const submitDesignation = async (form: FormIOForm<DesignationModel>) => {
      try {
        processing.value = true;
        await DesignationAgreementService.shared.submitDesignationAgreement({
          dynamicData: form.data.dynamicData,
          locations: form.data.locations.map(
            (location: DesignationLocationsListItem) => ({
              locationId: location.locationId,
              requestForDesignation: location.requestForDesignation,
            }),
          ),
        } as SubmitDesignationAgreementDto);
        snackBar.success("Designation agreement submitted.");
        goBack();
      } catch (error) {
        snackBar.error(
          "An unexpected error happened during the designation agreement submission.",
        );
      } finally {
        processing.value = false;
      }
    };

    return {
      designationModel,
      submitDesignation,
      InstitutionRoutesConst,
      goBackRouteParams,
      goBack,
      processing,
    };
  },
};
</script>
