<template>
  <v-navigation-drawer app color="default" permanent>
    <v-list
      active-class="active-list-item"
      density="compact"
      bg-color="default"
      active-color="primary"
      class="no-wrap"
      :items="menuItems"
    />
    <template #append>
      <v-list
        density="compact"
        active-class="active-list-item"
        bg-color="default"
        class="no-wrap"
        active-color="primary"
        nav
      >
        <check-permission-role :role="Role.AESTReports">
          <template #="{ notAllowed }">
            <v-list-item
              :to="{ name: AESTRoutesConst.REPORTS }"
              prepend-icon="mdi-home-outline"
              title="Reports"
              :disabled="notAllowed"
            />
          </template>
        </check-permission-role>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>
<script lang="ts">
import { AESTRoutesConst } from "@/constants/routes/RouteConstants";
import { MenuItemModel, Role } from "@/types";
import { ref } from "vue";
import CheckPermissionRole from "@/components/generic/CheckPermissionRole.vue";

export default {
  components: { CheckPermissionRole },
  setup() {
    const menuItems = ref<MenuItemModel[]>([
      {
        title: "Home",
        props: {
          prependIcon: "mdi-home-outline",
          to: {
            name: AESTRoutesConst.AEST_DASHBOARD,
          },
        },
      },
      {
        title: "Search Students",
        props: {
          prependIcon: "mdi-magnify",
          to: {
            name: AESTRoutesConst.SEARCH_STUDENTS,
          },
        },
      },
      {
        title: "Search Institutions",
        props: {
          prependIcon: "mdi-magnify",
          to: {
            name: AESTRoutesConst.SEARCH_INSTITUTIONS,
          },
        },
      },
      {
        type: "subheader",
        title: "Student requests",
      },
      {
        title: "Accounts",
        props: {
          prependIcon: "mdi-account-outline",
          to: {
            name: AESTRoutesConst.STUDENT_ACCOUNT_APPLICATIONS,
          },
        },
      },
      {
        title: "Exceptions",
        props: {
          prependIcon: "mdi-check-circle-outline",
          to: {
            name: AESTRoutesConst.APPLICATION_EXCEPTIONS_PENDING,
          },
        },
      },
      {
        title: "Appeals",
        props: {
          prependIcon: "mdi-folder-open-outline",
          to: {
            name: AESTRoutesConst.APPLICATION_APPEALS_PENDING,
          },
        },
      },
      {
        type: "subheader",
        title: "Institution requests",
      },
      {
        title: "Designations",
        props: {
          prependIcon: "mdi-bookmark-outline",
          to: {
            name: AESTRoutesConst.PENDING_DESIGNATIONS,
          },
        },
      },
      {
        title: "Offerings",
        props: {
          prependIcon: "mdi-view-list-outline",
          to: {
            name: AESTRoutesConst.OFFERING_CHANGE_REQUESTS,
          },
        },
      },
    ]);
    return {
      menuItems,
      AESTRoutesConst,
      Role,
    };
  },
};
</script>
