<template>
  <full-page-container :full-width="true">
    <template #header>
      <header-navigator
        title="Program detail"
        :routeLocation="routeLocation"
        subTitle="Add offering"
      />
    </template>
    <offering-form-submit
      submitLabel="Add offering now"
      :formMode="OfferingFormModes.Editable"
      :locationId="locationId"
      :programId="programId"
      @submit="submit"
      @cancel="goBack"
    ></offering-form-submit>
  </full-page-container>
</template>

<script lang="ts">
import { useRouter } from "vue-router";
import { computed, defineComponent, ref } from "vue";
import { OfferingFormModes, OfferingStatus } from "@/types";
import { InstitutionRoutesConst } from "@/constants/routes/RouteConstants";
import OfferingFormSubmit from "@/components/common/OfferingFormSubmit.vue";
import { BannerTypes } from "@/types/contracts/Banner";
import { EducationProgramOfferingService } from "@/services/EducationProgramOfferingService";
import { EducationProgramOfferingAPIInDTO } from "@/services/http/dto";
import { useSnackBar } from "@/composables";

export default defineComponent({
  components: {
    OfferingFormSubmit,
  },
  props: {
    locationId: {
      type: Number,
      required: true,
    },
    programId: {
      type: Number,
      required: true,
    },
    institutionId: {
      type: Number,
      required: false,
    },
  },
  setup(props) {
    const snackBar = useSnackBar();
    const router = useRouter();
    const processing = ref(false);

    const routeLocation = computed(() => ({
      name: InstitutionRoutesConst.VIEW_LOCATION_PROGRAMS,
      params: {
        programId: props.programId,
        locationId: props.locationId,
      },
    }));

    const submit = async (data: EducationProgramOfferingAPIInDTO) => {
      try {
        processing.value = true;
        await EducationProgramOfferingService.shared.createProgramOffering(
          props.locationId,
          props.programId,
          data,
        );
        snackBar.success("Offering created.");
        goBack();
      } catch {
        snackBar.error(
          "Unexpected error happened while creating the offering.",
        );
      } finally {
        processing.value = false;
      }
    };

    const goBack = () => {
      router.push(routeLocation.value);
    };

    return {
      InstitutionRoutesConst,
      OfferingStatus,
      BannerTypes,
      routeLocation,
      goBack,
      OfferingFormModes,
      submit,
    };
  },
});
</script>
