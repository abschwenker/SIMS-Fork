<template>
  <v-navigation-drawer app permanent color="default">
    <v-list
      density="compact"
      bg-color="default"
      active-color="primary"
      class="sidebar-item no-wrap"
      active-class="active-list-item"
      :items="items"
    >
    </v-list
    ><template #append>
      <v-list
        density="compact"
        nav
        class="sidebar-item no-wrap"
        active-class="active-list-item"
        bg-color="default"
        active-color="primary"
      >
        <v-list-item
          :to="{ name: InstitutionRoutesConst.OFFERINGS_UPLOAD }"
          prepend-icon="fa:fa-solid fa-upload"
          title="Offerings Upload"
        /> </v-list
    ></template>
  </v-navigation-drawer>
</template>
<script lang="ts">
import { ref } from "vue";
import { InstitutionRoutesConst } from "@/constants/routes/RouteConstants";
import { MenuItemModel } from "@/types";

export default {
  components: {},
  setup() {
    const items = ref<MenuItemModel[]>([
      {
        title: "Manage Profile",
        props: {
          prependIcon: "fa:far fa-address-card-o",
          to: {
            name: InstitutionRoutesConst.INSTITUTION_PROFILE_EDIT,
          },
        },
      },
      {
        title: "Manage Locations",
        props: {
          prependIcon: "fa:far fa-compass",
          to: {
            name: InstitutionRoutesConst.MANAGE_LOCATIONS,
          },
        },
      },
      {
        title: "Manage Designation",
        props: {
          prependIcon: "fa:far fa-bookmark-o",
          to: {
            name: InstitutionRoutesConst.MANAGE_DESIGNATION,
          },
        },
      },
      {
        title: "Manage Users",
        props: {
          prependIcon: "fa:far fa-user-o",
          to: {
            name: InstitutionRoutesConst.MANAGE_USERS,
          },
        },
      },
    ]);

    return {
      items,
      InstitutionRoutesConst,
    };
  },
};
</script>
