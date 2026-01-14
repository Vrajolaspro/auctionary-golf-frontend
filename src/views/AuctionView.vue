<template>
  <div class="wrap">
    <section class="panel">
      <div class="head">
        <div>
          <div class="crumb" @click="goHome">← Back to Live Auctions</div>
          <h1 class="title">{{ item?.name || "Auction" }}</h1>
          <p class="sub" v-if="item">
            Sold by
            <span class="accent"
              >{{ item.first_name }} {{ item.last_name }}</span
            >
            • Ends
            <span :class="{ danger: endsIn === 'Ended' }">{{ endsIn }}</span>
          </p>
        </div>
        <div class="pill">#{{ routeId }}</div>
      </div>
      <p class="desc" v-if="item">{{ item.description }}</p>
      <div class="stats" v-if="item">
        <div class="stat">
          <div class="label">Starting Bid</div>
          <div class="value">£{{ item.starting_bid }}</div>
        </div>
        <div class="stat">
          <div class="label">Current Bid</div>
          <div class="value">£{{ item.current_bid }}</div>
          <div class="small" v-if="item.current_bid_holder">
            Current leader: {{ item.current_bid_holder.first_name }}
            {{ item.current_bid_holder.last_name }}
          </div>
          <div class="small" v-else>No bids yet</div>
        </div>
        <div class="stat">
          <div class="label">Status</div>
          <div class="value" :class="{ danger: endsIn === 'Ended' }">
            {{ endsIn === "Ended" ? "Ended" : "Live" }}
          </div>
        </div>
      </div>
      <div v-if="error" class="error">
        {{ error }}
        <button class="ghost" @click="loadAll" :disabled="loading">
          Retry
        </button>
      </div>
      <div v-if="loading" class="loading">Loading auction…</div>
    </section>
    <section class="panel" v-if="item">
      <h2 class="h2">Place a Bid</h2>
      <div v-if="!isLoggedIn" class="note">Sign in to place a bid.</div>
      <div v-else-if="isSeller" class="note">
        You can’t bid on your own auction.
      </div>
      <div v-else-if="endsIn === 'Ended'" class="note">
        Auction has ended. Bidding is closed.
      </div>
      <form v-else class="formRow" @submit.prevent="placeBid">
        <input
          class="input"
          v-model="bidAmount"
          type="number"
          min="1"
          step="1"
          placeholder="Enter bid amount (whole number)"
        />
        <button class="primary" type="submit" :disabled="actionLoading">
          Place Bid
        </button>
      </form>
      <div class="hint" v-if="item">
        Must be higher than current: £{{ item.current_bid }}
      </div>
      <div v-if="actionError" class="errorSmall">{{ actionError }}</div>
      <div v-if="actionOk" class="okSmall">{{ actionOk }}</div>
    </section>
    <section class="panel" v-if="item">
      <h2 class="h2">Bid History</h2>
      <div v-if="bids.length === 0" class="note">No bids yet.</div>
      <div v-else class="list">
        <div class="row" v-for="(b, idx) in bids" :key="idx">
          <div class="rowLeft">
            <div class="rowTitle">£{{ b.amount }}</div>
            <div class="rowSub">{{ b.first_name }} {{ b.last_name }}</div>
          </div>
          <div class="rowRight">
            {{ formatTime(b.timestamp) }}
          </div>
        </div>
      </div>
    </section>
    <section class="panel" v-if="item">
      <h2 class="h2">Questions</h2>
      <div v-if="questions.length === 0" class="note">No questions yet.</div>
      <div v-else class="qList">
        <div class="qCard" v-for="q in questions" :key="q.question_id">
          <div class="qTop">
            <div class="qTitle">Q: {{ q.question_text }}</div>
            <div class="qId">#{{ q.question_id }}</div>
          </div>
          <div class="qAns" v-if="q.answer_text">
            <span class="tag">A</span> {{ q.answer_text }}
          </div>
          <div class="qAns muted" v-else>
            <span class="tag mutedTag">A</span> Not answered yet
          </div>
          <form
            v-if="isLoggedIn && isSeller && !q.answer_text"
            class="answerRow"
            @submit.prevent="answerQuestion(q.question_id)"
          >
            <input
              class="input"
              v-model="answers[q.question_id]"
              placeholder="Write an answer…"
            />
            <button class="primary" type="submit" :disabled="actionLoading">
              Answer
            </button>
          </form>
        </div>
      </div>
      <h3 class="h3">Ask a Question</h3>
      <div v-if="!isLoggedIn" class="note">Sign in to ask a question.</div>
      <div v-else-if="isSeller" class="note">
        You can’t ask questions on your own auction.
      </div>
      <form v-else class="formRow" @submit.prevent="askQuestion">
        <input
          class="input"
          v-model="questionText"
          placeholder="Type your question…"
        />
        <button class="primary" type="submit" :disabled="actionLoading">
          Ask
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "../services/api";

const route = useRoute();
const router = useRouter();
const routeId = computed(() => route.params.id);
const item = ref(null);
const bids = ref([]);
const questions = ref([]);
const loading = ref(false);
const error = ref("");
const actionLoading = ref(false);
const actionError = ref("");
const actionOk = ref("");
const bidAmount = ref("");
const questionText = ref("");
const answers = ref({});
const isLoggedIn = computed(() => !!localStorage.getItem("session_token"));
const myUserId = computed(() => {
  const v = localStorage.getItem("user_id");
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
});
const isSeller = computed(() => {
  if (!item.value) return false;
  if (!myUserId.value) return false;
  return Number(item.value.creator_id) === Number(myUserId.value);
});

function formatCountdown(endMs) {
  const diff = Number(endMs) - Date.now();
  if (!Number.isFinite(diff)) return "—";
  if (diff <= 0) return "Ended";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

const endsIn = computed(() =>
  item.value ? formatCountdown(item.value.end_date) : "—"
);

function formatTime(ms) {
  const d = new Date(Number(ms));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function goHome() {
  router.push("/");
}

async function loadItem() {
  const res = await api.get(`/item/${routeId.value}`);
  item.value = res.data;
}

async function loadBids() {
  const res = await api.get(`/item/${routeId.value}/bid`);
  bids.value = Array.isArray(res.data) ? res.data : [];
}

async function loadQuestions() {
  const res = await api.get(`/item/${routeId.value}/question`);
  questions.value = Array.isArray(res.data) ? res.data : [];
}

async function loadAll() {
  loading.value = true;
  error.value = "";
  try {
    await Promise.all([loadItem(), loadBids(), loadQuestions()]);
  } catch (e) {
    error.value =
      e?.response?.data?.error_message ||
      e?.message ||
      "Failed to load auction.";
  } finally {
    loading.value = false;
  }
}

async function placeBid() {
  actionError.value = "";
  actionOk.value = "";

  const amt = Number(bidAmount.value);
  if (!Number.isFinite(amt) || Math.floor(amt) !== amt || amt <= 0) {
    actionError.value = "Bid must be a whole number greater than 0.";
    return;
  }

  actionLoading.value = true;
  try {
    await api.post(`/item/${routeId.value}/bid`, { amount: amt });
    actionOk.value = "Bid placed!";
    bidAmount.value = "";
    await loadAll();
  } catch (e) {
    actionError.value =
      e?.response?.data?.error_message ||
      (e?.response?.status === 401 ? "You must be logged in." : "") ||
      e?.message ||
      "Failed to place bid.";
  } finally {
    actionLoading.value = false;
  }
}

async function askQuestion() {
  actionError.value = "";
  actionOk.value = "";

  const text = questionText.value.trim();
  if (!text) {
    actionError.value = "Question cannot be empty.";
    return;
  }

  actionLoading.value = true;
  try {
    await api.post(`/item/${routeId.value}/question`, { question_text: text });
    actionOk.value = "Question submitted!";
    questionText.value = "";
    await loadQuestions();
  } catch (e) {
    actionError.value =
      e?.response?.data?.error_message ||
      (e?.response?.status === 401 ? "You must be logged in." : "") ||
      e?.message ||
      "Failed to submit question.";
  } finally {
    actionLoading.value = false;
  }
}

async function answerQuestion(questionId) {
  actionError.value = "";
  actionOk.value = "";

  const text = (answers.value[questionId] || "").trim();
  if (!text) {
    actionError.value = "Answer cannot be empty.";
    return;
  }

  actionLoading.value = true;
  try {
    await api.post(`/question/${questionId}`, { answer_text: text });
    actionOk.value = "Answer posted!";
    answers.value[questionId] = "";
    await loadQuestions();
  } catch (e) {
    actionError.value =
      e?.response?.data?.error_message ||
      e?.message ||
      "Failed to post answer.";
  } finally {
    actionLoading.value = false;
  }
}
</script>

<style scoped>
.wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding: 18px 16px 0;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 18px;
  margin-bottom: 14px;
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.crumb {
  color: rgba(233, 238, 252, 0.65);
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 6px;
}
.crumb:hover {
  color: rgba(233, 238, 252, 0.9);
}

.title {
  margin: 0;
  font-size: 32px;
  font-weight: 900;
}
.sub {
  margin: 8px 0 0;
  color: rgba(233, 238, 252, 0.7);
  font-size: 13px;
}
.accent {
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

.pill {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 12px;
  white-space: nowrap;
}

.desc {
  margin: 14px 0 0;
  color: rgba(233, 238, 252, 0.86);
  line-height: 1.5;
}

.stats {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.stat {
  padding: 12px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}
.label {
  font-size: 12px;
  color: rgba(233, 238, 252, 0.55);
}
.value {
  font-size: 18px;
  font-weight: 900;
  margin-top: 3px;
}
.small {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(233, 238, 252, 0.7);
}

.h2 {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 900;
}
.h3 {
  margin: 14px 0 10px;
  font-size: 14px;
  font-weight: 900;
  color: rgba(233, 238, 252, 0.85);
}

.formRow {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.input {
  flex: 1;
  min-width: 240px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  outline: none;
}
.input::placeholder {
  color: rgba(233, 238, 252, 0.45);
}

.primary {
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
.primary:hover {
  box-shadow: 0 16px 40px rgba(46, 204, 113, 0.18);
}

.ghost {
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(233, 238, 252, 0.85);
  cursor: pointer;
}

.note {
  padding: 12px;
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.16);
  color: rgba(233, 238, 252, 0.75);
  margin-bottom: 10px;
}

.hint {
  margin-top: 10px;
  color: rgba(233, 238, 252, 0.65);
  font-size: 12px;
}

.list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}
.rowTitle {
  font-weight: 900;
}
.rowSub {
  font-size: 12px;
  color: rgba(233, 238, 252, 0.7);
  margin-top: 2px;
}
.rowRight {
  font-size: 12px;
  color: rgba(233, 238, 252, 0.6);
  white-space: nowrap;
}

.qList {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.qCard {
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}
.qTop {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}
.qTitle {
  font-weight: 900;
}
.qId {
  font-size: 12px;
  color: rgba(233, 238, 252, 0.55);
  white-space: nowrap;
}
.qAns {
  margin-top: 8px;
  color: rgba(233, 238, 252, 0.85);
  line-height: 1.4;
}
.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  margin-right: 6px;
  background: rgba(46, 204, 113, 0.16);
  border: 1px solid rgba(46, 204, 113, 0.3);
  font-size: 12px;
  font-weight: 900;
}
.muted {
  color: rgba(233, 238, 252, 0.6);
}
.mutedTag {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.14);
}

.answerRow {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.loading {
  padding: 12px;
  color: rgba(233, 238, 252, 0.8);
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
  margin-top: 12px;
}
.errorSmall {
  margin-top: 10px;
  color: rgba(255, 107, 107, 0.95);
  font-size: 13px;
}
.okSmall {
  margin-top: 10px;
  color: rgba(46, 204, 113, 0.95);
  font-size: 13px;
}
.danger {
  color: rgba(255, 107, 107, 0.95);
}

@media (max-width: 860px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
