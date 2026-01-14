<template>
  <div class="wrap">
    <section class="hero">
      <div class="heroInner">
        <h1 class="heroTitle">
          Auctionary
          <span class="heroAccent">Golf-Inspired Auctions</span>
        </h1>
        <form class="heroSearch" @submit.prevent="applySearch">
          <span class="searchIcon">⌕</span>
          <input
            v-model="qInput"
            class="searchInput"
            type="text"
            placeholder="Search listings (name or description)…"
            autocomplete="off"
          />
          <button class="searchBtn" type="submit" :disabled="loading">
            Search
          </button>
        </form>
        <button class="heroSellBtn" type="button" @click="goToCreateAuction">
          Create Auction
        </button>
        <button class="heroSellBtn" type="button" @click="goToDrafts" style="margin-top:10px;">
          View Drafts
        </button>
      </div>
    </section>
    <section class="content">
      <div class="sectionHead">
        <div>
          <h2 class="sectionTitle">Live Auctions</h2>
          <p class="sectionSub" v-if="q">Filtered by “{{ q }}”</p>
          <p class="sectionSub" v-else>Browse active listings from the API</p>
        </div>
        <div class="mini">
          <button
            class="ghost"
            @click="prevPage"
            :disabled="loading || offset === 0"
          >
            Prev
          </button>
          <button
            class="ghost"
            @click="nextPage"
            :disabled="loading || items.length < limit"
          >
            Next
          </button>
          <label class="miniLabel">
            Limit
            <select
              class="select"
              v-model.number="limit"
              :disabled="loading"
              @change="resetAndLoad"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
            </select>
          </label>
        </div>
      </div>
      <div v-if="error" class="error">
        {{ error }}
        <button class="ghost" @click="load">Retry</button>
      </div>
      <div v-if="loading" class="loading">Loading auctions…</div>
      <div v-else class="grid">
        <AuctionCard v-for="it in items" :key="it.item_id" :item="it" />
      </div>
      <div v-if="!loading && !error && items.length === 0" class="empty">
        No auctions found.
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "../services/api";
import AuctionCard from "../components/AuctionCard.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const items = ref([]);
const loading = ref(false);
const error = ref("");
const q = ref("");
const qInput = ref("");
const limit = ref(10);
const offset = ref(0);

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const params = { limit: limit.value, offset: offset.value };
    if (q.value) params.q = q.value;
    const res = await api.get("/search", { params });
    items.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    error.value =
      e?.response?.data?.error_message ||
      e?.message ||
      "Failed to load auctions.";
    items.value = [];
  } finally {
    loading.value = false;
  }
}

function applySearch() {
  q.value = qInput.value.trim();
  offset.value = 0;
  load();
}

function nextPage() {
  offset.value += 1;
  load();
}

function prevPage() {
  offset.value = Math.max(0, offset.value - 1);
  load();
}

function resetAndLoad() {
  offset.value = 0;
  load();
}

function goToCreateAuction() {
  router.push("/create");
}

function goToDrafts() {
  router.push("/drafts");
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
  padding: 56px 0 22px;
}

.heroInner {
  text-align: center;
  padding: 26px 18px 22px;
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
  font-size: 44px;
  font-weight: 900;
  letter-spacing: 0.2px;
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
}

.heroSearch {
  max-width: 740px;
  margin: 18px auto 0;
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px 10px 44px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.heroSellBtn {
  max-width: 740px;
  width: 100%;
  margin: 12px auto 0;
  display: block;
  padding: 14px 16px;
  border-radius: 18px;
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

.heroSellBtn:hover {
  box-shadow: 0 16px 40px rgba(46, 204, 113, 0.18);
}

.searchIcon {
  position: absolute;
  left: 16px;
  color: rgba(233, 238, 252, 0.45);
  font-weight: 900;
}

.searchInput {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text);
  font-size: 15px;
  padding: 10px 0;
}

.searchInput::placeholder {
  color: rgba(233, 238, 252, 0.45);
}

.searchBtn {
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(46, 204, 113, 0.3);
  background: linear-gradient(
    90deg,
    rgba(46, 204, 113, 0.95),
    rgba(59, 130, 246, 0.95)
  );
  color: white;
  font-weight: 800;
  cursor: pointer;
}

.searchBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.content {
  padding: 18px 0 0;
}

.sectionHead {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.sectionTitle {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
}

.sectionSub {
  margin: 6px 0 0;
  color: rgba(233, 238, 252, 0.65);
  font-size: 13px;
}

.mini {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.miniLabel {
  font-size: 13px;
  color: rgba(233, 238, 252, 0.7);
}

.select {
  margin-left: 8px;
  padding: 9px 10px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text);
}

.ghost {
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(233, 238, 252, 0.85);
  cursor: pointer;
}

.ghost:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  .heroTitle {
    font-size: 38px;
  }
}

@media (max-width: 560px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .heroTitle {
    font-size: 32px;
  }
  .heroSearch {
    flex-direction: column;
    align-items: stretch;
    padding-left: 44px;
  }
  .searchBtn {
    width: 100%;
  }
}

.loading {
  padding: 14px;
  color: rgba(233, 238, 252, 0.8);
}

.empty {
  padding: 16px;
  border-radius: 18px;
  border: 1px dashed rgba(255, 255, 255, 0.16);
  color: rgba(233, 238, 252, 0.75);
}

.error {
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 107, 107, 0.35);
  background: rgba(255, 107, 107, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}
</style>
