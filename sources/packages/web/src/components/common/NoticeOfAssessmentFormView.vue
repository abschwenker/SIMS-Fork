<template>
  <formio-container formName="noticeOfAssessment" :formData="initialData" />
</template>

<script lang="ts">
import { watch, defineComponent, ref, onMounted } from "vue";
import { StudentAssessmentsService } from "@/services/StudentAssessmentsService";
import { AssessmentNOAAPIOutDTO } from "@/services/http/dto";

interface NoticeOfAssessment extends AssessmentNOAAPIOutDTO {
  viewOnly?: boolean;
}

export default defineComponent({
  emits: ["assessmentDataLoaded"],
  props: {
    assessmentId: {
      type: Number,
      required: true,
    },
    viewOnly: {
      type: Boolean,
      required: false,
    },
  },
  setup(props, { emit }) {
    const initialData = ref({} as NoticeOfAssessment);

    onMounted(async () => {
      const assessment =
        await StudentAssessmentsService.shared.getAssessmentNOA(
          props.assessmentId,
        );
      initialData.value = { ...assessment, viewOnly: props.viewOnly };
      emit(
        "assessmentDataLoaded",
        initialData.value?.applicationStatus,
        initialData.value.noaApprovalStatus,
      );
    });

    watch(
      () => props.viewOnly,
      () => {
        initialData.value.viewOnly = props.viewOnly;
      },
    );

    return {
      initialData,
    };
  },
});
</script>
