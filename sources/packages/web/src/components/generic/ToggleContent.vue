<template>
  <div v-if="toggled">
    <v-row justify="center" class="mt-1">
      <slot name="image">
        <v-img
          height="150"
          alt="There's nothing here yet"
          src="@/assets/images/playful-cat.svg"
        />
      </slot>
    </v-row>
    <v-row justify="center mt-5">
      <slot name="message">
        <h5 class="muted-content-strong">{{ message }}</h5>
      </slot>
    </v-row>
  </div>
  <slot v-else></slot>
</template>

<script lang="ts">
export default {
  props: {
    toggled: {
      type: Boolean,
      required: true,
    },
    message: {
      type: String,
      required: true,
      default: "There's nothing here yet",
    },
  },
};
</script>
