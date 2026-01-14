<template>
  <ModalShell
    :title="active === 'login' ? 'Sign In' : 'Register'"
    @close="$emit('close')"
  >
    <div class="tabs">
      <button
        class="tab"
        :class="{ active: active === 'login' }"
        @click="active = 'login'"
      >
        Sign In
      </button>
      <button
        class="tab"
        :class="{ active: active === 'register' }"
        @click="active = 'register'"
      >
        Register
      </button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="ok" class="ok">{{ ok }}</div>

    <!-- LOGIN -->
    <form v-if="active === 'login'" class="form" @submit.prevent="doLogin">
      <label class="label">Email</label>
      <input
        class="input"
        v-model="loginEmail"
        type="email"
        autocomplete="email"
      />

      <label class="label">Password</label>
      <input
        class="input"
        v-model="loginPassword"
        type="password"
        autocomplete="current-password"
      />

      <button class="primary" type="submit" :disabled="loading">
        {{ loading ? "Signing in..." : "Sign In" }}
      </button>
    </form>

    <!-- REGISTER -->
    <form v-else class="form" @submit.prevent="doRegister">
      <div class="grid2">
        <div>
          <label class="label">First name</label>
          <input class="input" v-model="firstName" autocomplete="given-name" />
        </div>
        <div>
          <label class="label">Last name</label>
          <input class="input" v-model="lastName" autocomplete="family-name" />
        </div>
      </div>

      <label class="label">Email</label>
      <input
        class="input"
        v-model="regEmail"
        type="email"
        autocomplete="email"
      />

      <label class="label">Password</label>
      <input
        class="input"
        v-model="regPassword"
        type="password"
        autocomplete="new-password"
      />

      <div class="hint">
        Password must be 8–30 chars and include uppercase, lowercase, number,
        and symbol.
      </div>

      <button class="primary" type="submit" :disabled="loading">
        {{ loading ? "Creating..." : "Create Account" }}
      </button>
    </form>
  </ModalShell>
</template>

<script setup>
import { ref, watch } from "vue";
import ModalShell from "./ModalShell.vue";
import { login, register } from "../services/auth";

const props = defineProps({
  startTab: { type: String, default: "login" }, // "login" | "register"
});

const emit = defineEmits(["close", "authed"]);

const active = ref(props.startTab);

watch(
  () => props.startTab,
  (v) => {
    active.value = v || "login";
    clearMessages();
  }
);

const loading = ref(false);
const error = ref("");
const ok = ref("");

const loginEmail = ref("");
const loginPassword = ref("");

const firstName = ref("");
const lastName = ref("");
const regEmail = ref("");
const regPassword = ref("");

function clearMessages() {
  error.value = "";
  ok.value = "";
}

async function doLogin() {
  clearMessages();
  loading.value = true;
  try {
    const data = await login(loginEmail.value.trim(), loginPassword.value);
    ok.value = "Signed in successfully.";
    emit("authed", data); // let App refresh UI
    emit("close");
  } catch (e) {
    error.value =
      e?.response?.data?.error_message || e?.message || "Failed to sign in.";
  } finally {
    loading.value = false;
  }
}

async function doRegister() {
  clearMessages();
  loading.value = true;
  try {
    await register(
      firstName.value.trim(),
      lastName.value.trim(),
      regEmail.value.trim(),
      regPassword.value
    );

    // UX: after registering, switch to login and prefill email
    ok.value = "Account created. Please sign in.";
    active.value = "login";
    loginEmail.value = regEmail.value.trim();
    loginPassword.value = "";
  } catch (e) {
    error.value =
      e?.response?.data?.error_message || e?.message || "Failed to register.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}
.tab {
  flex: 1;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(233, 238, 252, 0.75);
  cursor: pointer;
  font-weight: 800;
}
.tab.active {
  border-color: rgba(46, 204, 113, 0.3);
  background: linear-gradient(
    90deg,
    rgba(46, 204, 113, 0.22),
    rgba(59, 130, 246, 0.18)
  );
  color: rgba(233, 238, 252, 0.95);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (max-width: 520px) {
  .grid2 {
    grid-template-columns: 1fr;
  }
}

.label {
  font-size: 12px;
  color: rgba(233, 238, 252, 0.7);
  font-weight: 800;
  margin-top: 2px;
}

.input {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  outline: none;
}
.input:focus {
  border-color: rgba(46, 204, 113, 0.35);
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
}

.primary {
  margin-top: 6px;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(46, 204, 113, 0.3);
  background: linear-gradient(
    90deg,
    rgba(46, 204, 113, 0.95),
    rgba(59, 130, 246, 0.95)
  );
  color: white;
  font-weight: 900;
  cursor: pointer;
}
.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hint {
  font-size: 12px;
  color: rgba(233, 238, 252, 0.6);
  margin-top: 2px;
}

.error {
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 107, 107, 0.35);
  background: rgba(255, 107, 107, 0.1);
  color: rgba(255, 220, 220, 0.95);
  margin-bottom: 12px;
}
.ok {
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(46, 204, 113, 0.3);
  background: rgba(46, 204, 113, 0.1);
  color: rgba(210, 255, 230, 0.95);
  margin-bottom: 12px;
}
</style>
