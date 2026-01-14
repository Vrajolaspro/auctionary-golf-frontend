<template>
  <div class="wrap">
    <section class="hero">
      <div class="heroInner">
        <h1 class="heroTitle">
          Create Auction
          <span class="heroAccent">List your item</span>
        </h1>
        <p class="heroSub">
          Enter the details below and publish your auction.
        </p>
      </div>
    </section>

    <section class="panel">
      <div v-if="!isLoggedIn" class="note">
        You must be signed in to create an auction.
      </div>

      <form v-else class="form" @submit.prevent="submit">
        <label class="label">Name</label>
        <input class="input" v-model="name" placeholder="e.g. TaylorMade SIM2 Max Driver" />

        <label class="label">Description</label>
        <textarea
          class="input textarea"
          v-model="description"
          placeholder="Describe condition, specs, collection/delivery, etc."
        />

        <div class="grid2">
          <div>
            <label class="label">Starting bid (£)</label>
            <input class="input" v-model="startingBid" type="number" min="0" step="1" />
          </div>

          <div>
            <label class="label">End date & time</label>
            <input class="input" v-model="endDateLocal" type="datetime-local" />
            <div class="hint">Must be in the future.</div>
          </div>
        </div>

        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="ok" class="ok">{{ ok }}</div>

        <button class="primary" type="submit" :disabled="loading">
          {{ loading ? "Creating..." : "Create Auction" }}
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "../services/api";

const router = useRouter();

const isLoggedIn = computed(() => !!localStorage.getItem("session_token"));

const name = ref("");
const description = ref("");
const startingBid = ref("");
const endDateLocal = ref(""); // yyyy-mm-ddThh:mm

const loading = ref(false);
const error = ref("");
const ok = ref("");

function toMsFromDatetimeLocal(v) {
  // datetime-local string is interpreted as local time by Date()
  const d = new Date(v);
  const ms = d.getTime();
  return Number.isFinite(ms) ? ms : null;
}

async function submit() {
  error.value = "";
  ok.value = "";

  const n = name.value.trim();
  const d = description.value.trim();
  const sb = Math.floor(Number(startingBid.value));
  const endMs = toMsFromDatetimeLocal(endDateLocal.value);

  if (!n) return (error.value = "name is required.");
  if (!d) return (error.value = "description is required.");
  if (!Number.isFinite(sb) || sb < 0) return (error.value = "starting_bid is invalid.");
  if (!endMs) return (error.value = "end_date is invalid.");
  if (endMs <= Date.now()) return (error.value = "end_date must be in the future.");

  loading.value = true;
  try {
    const res = await api.post("/item", {
      name: n,
      description: d,
      starting_bid: sb,
      end_date: endMs, // backend accepts ms
    });

    const itemId = res?.data?.item_id;
    ok.value = "Auction created!";
    if (itemId) router.push(`/auction/${itemId}`);
  } catch (e) {
    error.value =
      e?.response?.data?.error_message ||
      (e?.response?.status === 401 ? "You must be logged in." : "") ||
      e?.message ||
      "Failed to create auction.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.wrap{
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 16px;
}

.hero{ padding: 36px 0 18px; }
.heroInner{
  text-align: center;
  padding: 22px 18px;
  border-radius: 26px;
  background: linear-gradient(90deg, rgba(46,204,113,.10), rgba(59,130,246,.10));
  border: 1px solid rgba(255,255,255,.10);
}
.heroTitle{
  margin: 0;
  font-size: 38px;
  font-weight: 900;
}
.heroAccent{
  display:block;
  margin-top: 6px;
  background: linear-gradient(90deg, rgba(46,204,113,.95), rgba(59,130,246,.95));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 900;
}
.heroSub{
  max-width: 760px;
  margin: 10px auto 0;
  color: rgba(233,238,252,.70);
  line-height: 1.5;
  font-size: 13px;
}

.panel{
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 18px;
  margin-top: 14px;
}

.form{
  display:flex;
  flex-direction:column;
  gap: 10px;
}

.grid2{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (max-width: 760px){
  .grid2{ grid-template-columns: 1fr; }
}

.label{
  font-size: 12px;
  color: rgba(233,238,252,.70);
  font-weight: 800;
  margin-top: 2px;
}

.input{
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  color: var(--text);
  outline: none;
}
.input:focus{
  border-color: rgba(46,204,113,.35);
  box-shadow: 0 0 0 3px rgba(46,204,113,.10);
}
.textarea{
  min-height: 110px;
  resize: vertical;
}

.primary{
  margin-top: 6px;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(46,204,113,.30);
  background: linear-gradient(90deg, rgba(46,204,113,.95), rgba(59,130,246,.95));
  color: white;
  font-weight: 900;
  cursor:pointer;
}
.primary:disabled{ opacity:.6; cursor:not-allowed; }
.primary:hover{ box-shadow: 0 16px 40px rgba(46,204,113,.18); }

.note{
  padding: 12px;
  border-radius: 16px;
  border: 1px dashed rgba(255,255,255,.16);
  color: rgba(233,238,252,.75);
}

.hint{
  margin-top: 6px;
  color: rgba(233,238,252,.60);
  font-size: 12px;
}

.error{
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(255,107,107,.35);
  background: rgba(255,107,107,.10);
  color: rgba(255,220,220,.95);
}
.ok{
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(46,204,113,.30);
  background: rgba(46,204,113,.10);
  color: rgba(210,255,230,.95);
}
</style>