import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AuctionView from "../views/AuctionView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/auction/:id", name: "auction", component: AuctionView, props: true },
  ],
});

export default router;