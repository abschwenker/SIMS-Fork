<template>
  <application-status-tracker-banner
    label="Draft application"
    content="Your application has not been submitted to StudentAid BC yet. Please complete and submit your application when you are ready."
    icon="fa:fas fa-pencil-alt"
    ><template #actions>
      <v-btn color="primary" @click="$emit('editApplication')"
        >Continue application
      </v-btn>
    </template>
  </application-status-tracker-banner>
</template>
<script lang="ts">
import ApplicationStatusTrackerBanner from "@/components/students/applicationTracker/generic/ApplicationStatusTrackerBanner.vue";
export default {
  emits: ["editApplication"],
  components: {
    ApplicationStatusTrackerBanner,
  },
};
</script>
