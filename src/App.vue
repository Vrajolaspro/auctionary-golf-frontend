<template>
  <div class="app">
    <header class="navWrap">
      <nav class="nav">
        <div class="brand" @click="goHome" style="cursor: pointer">
          <div class="logo">⛳</div>
          <div class="brandText">
            <div class="brandTitle">Auctionary</div>
            <div class="brandSub">Premium auctions • golf-inspired theme</div>
          </div>
        </div>

        <div class="navActions">
          <template v-if="!session.isLoggedIn">
            <button class="btnGhost" type="button" @click="openAuth('login')">
              Sign In
            </button>
            <button
              class="btnPrimary"
              type="button"
              @click="openAuth('register')"
            >
              Register
            </button>
          </template>

          <template v-else>
            <div class="who">User #{{ session.userId }}</div>
            <button
              class="btnGhost"
              type="button"
              @click="router.push('/profile')"
            >
              Profile
            </button>
            <button class="btnGhost" type="button" @click="doLogout">
              Logout
            </button>
          </template>
        </div>
      </nav>
    </header>

    <main>
      <router-view />
    </main>

    <footer class="footer">
      <div class="footerInner">
        <div>© 2026 Auctionary</div>
        <div class="muted">
          Golf-inspired branding • generic auction template
        </div>
      </div>
    </footer>

    <AuthModal
      v-if="authOpen"
      :startTab="authTab"
      @close="authOpen = false"
      @authed="refreshSession"
    />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AuthModal from "./components/AuthModal.vue";
import { getSession, logout } from "./services/auth";

const router = useRouter();

const session = reactive({
  isLoggedIn: false,
  userId: null,
});

const authOpen = ref(false);
const authTab = ref("login");

function refreshSession() {
  const s = getSession();
  session.isLoggedIn = s.isLoggedIn;
  session.userId = s.userId;
}

function openAuth(tab) {
  authTab.value = tab;
  authOpen.value = true;
}

async function doLogout() {
  await logout();
  refreshSession();
  router.push("/");
}

function goHome() {
  router.push("/");
}

onMounted(refreshSession);
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
.navWrap {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(8, 12, 22, 0.55);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.nav {
  max-width: 1120px;
  margin: 0 auto;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(46, 204, 113, 0.16);
  border: 1px solid rgba(46, 204, 113, 0.28);
}
.brandTitle {
  font-weight: 800;
  letter-spacing: 0.2px;
}
.brandSub {
  font-size: 12px;
  color: rgba(233, 238, 252, 0.65);
}
.navActions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.who {
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(233, 238, 252, 0.8);
  font-size: 13px;
}

.btnGhost {
  padding: 10px 14px;
  border-radius: 999px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: rgba(233, 238, 252, 0.85);
  cursor: pointer;
}
.btnGhost:hover {
  border-color: rgba(46, 204, 113, 0.35);
}
.btnPrimary {
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid rgba(46, 204, 113, 0.3);
  background: linear-gradient(
    90deg,
    rgba(46, 204, 113, 0.95),
    rgba(59, 130, 246, 0.95)
  );
  color: white;
  font-weight: 700;
  cursor: pointer;
}
.btnPrimary:hover {
  box-shadow: 0 12px 30px rgba(46, 204, 113, 0.18);
}
.footer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(8, 12, 22, 0.35);
}
.footerInner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 22px 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.muted {
  color: rgba(233, 238, 252, 0.6);
  font-size: 13px;
}
</style>
