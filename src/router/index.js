import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AuctionView from "../views/AuctionView.vue";
import ProfileView from "../views/ProfileView.vue";
import CreateAuctionView from "../views/CreateAuctionView.vue"; // ✅ add

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView },
    {
      path: "/auction/:id",
      name: "auction",
      component: AuctionView,
      props: true,
    },
    { path: "/profile", name: "profile", component: ProfileView },
    { path: "/create", name: "create", component: CreateAuctionView }, // ✅ add
  ],
});

export default router;
