<!--
Used when we need to display header title and the value
-->
<template>
  <div>
    <span class="label-bold-normal">{{ title }} : </span>
    <slot name="value">
      <span class="label-value-normal"> {{ value }} </span>
    </slot>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
};
</script>
