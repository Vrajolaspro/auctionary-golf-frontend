<template>
  <div class="wrap">
    <section class="hero">
      <div class="heroInner">
        <h1 class="heroTitle">
          Profile
          <span class="heroAccent" v-if="profile">
            {{ profile.first_name }} {{ profile.last_name }}
          </span>
          <span class="heroAccent" v-else>My Account</span>
        </h1>
      </div>
    </section>
    <div v-if="error" class="error">
      {{ error }}
      <button class="ghost" @click="load" :disabled="loading">Retry</button>
    </div>
    <div v-if="loading" class="loading">Loading profile…</div>
    <template v-else>
      <section class="panel" v-if="!isLoggedIn">
        <h2 class="h2">You’re not signed in</h2>
        <p class="note">Please sign in to view your profile.</p>
      </section>
      <template v-else-if="profile">
        <section class="panel">
          <div class="panelHead">
            <h2 class="h2">Selling (Live)</h2>
            <span class="count">{{ profile.selling.length }}</span>
          </div>
          <div v-if="profile.selling.length === 0" class="note">
            You’re not selling any live items.
          </div>
          <div v-else class="grid">
            <AuctionCard
              v-for="it in profile.selling"
              :key="it.item_id"
              :item="it"
            />
          </div>
        </section>
        <section class="panel">
          <div class="panelHead">
            <h2 class="h2">Bidding On (Live)</h2>
            <span class="count">{{ profile.bidding_on.length }}</span>
          </div>
          <div v-if="profile.bidding_on.length === 0" class="note">
            You’re not currently bidding on anything.
          </div>
          <div v-else class="grid">
            <AuctionCard
              v-for="it in profile.bidding_on"
              :key="it.item_id"
              :item="it"
            />
          </div>
        </section>
        <section class="panel">
          <div class="panelHead">
            <h2 class="h2">Auctions Ended</h2>
            <span class="count">{{ profile.auctions_ended.length }}</span>
          </div>
          <div v-if="profile.auctions_ended.length === 0" class="note">
            No ended auctions yet.
          </div>
          <div v-else class="grid">
            <AuctionCard
              v-for="it in profile.auctions_ended"
              :key="it.item_id"
              :item="it"
            />
          </div>
          <div class="hint">
            Ended auctions will still open in the Auction page (read-only for
            bidding).
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import AuctionCard from "../components/AuctionCard.vue";
import { getMyProfile } from "../services/profile";

const isLoggedIn = computed(() => !!localStorage.getItem("session_token"));
const profile = ref(null);
const loading = ref(false);
const error = ref("");

async function load() {
  loading.value = true;
  error.value = "";
  profile.value = null;
  if (!isLoggedIn.value) {
    loading.value = false;
    return;
  }
  try {
    profile.value = await getMyProfile();
  } catch (e) {
    error.value =
      e?.response?.data?.error_message ||
      e?.message ||
      "Failed to load profile.";
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 16px;
}

.hero {
  padding: 36px 0 18px;
}

.heroInner {
  text-align: center;
  padding: 22px 18px;
  border-radius: 26px;
  background: linear-gradient(
    90deg,
    rgba(46, 204, 113, 0.1),
    rgba(59, 130, 246, 0.1)
  );
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.heroTitle {
  margin: 0;
  font-size: 38px;
  font-weight: 900;
}

.heroAccent {
  display: block;
  margin-top: 6px;
  background: linear-gradient(
    90deg,
    rgba(46, 204, 113, 0.95),
    rgba(59, 130, 246, 0.95)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 900;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 18px;
  margin-top: 14px;
}

.panelHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
}

.count {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(233, 238, 252, 0.85);
  font-size: 12px;
  font-weight: 800;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 920px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 560px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.loading {
  padding: 14px;
  color: rgba(233, 238, 252, 0.8);
}

.note {
  padding: 12px;
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.16);
  color: rgba(233, 238, 252, 0.75);
}

.hint {
  margin-top: 10px;
  color: rgba(233, 238, 252, 0.65);
  font-size: 12px;
}

.error {
  margin-top: 14px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 107, 107, 0.35);
  background: rgba(255, 107, 107, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ghost {
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(233, 238, 252, 0.85);
  cursor: pointer;
}
</style>
