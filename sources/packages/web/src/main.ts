import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import PrimeVue from "primevue/config";
import Menubar from "primevue/menubar";
import InputText from "primevue/inputtext";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Card from "primevue/card";
import Button from "primevue/button";
import "primevue/resources/themes/md-light-indigo/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import { AppConfigService } from "./services/AppConfigService";

AppConfigService.shared.init().then(() => {
  createApp(App)
    .use(store)
    .use(router)
    .use(PrimeVue)
    .component("Menubar", Menubar)
    .component("Card", Card)
    .component("Button", Button)
    .component("DataTable", DataTable)
    .component("Column", Column)
    .component("InputText", InputText)
    .mount("#app");
});
