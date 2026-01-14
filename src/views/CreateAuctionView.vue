<template>
  <div class="wrap">
    <section class="hero">
      <div class="heroInner">
        <h1 class="heroTitle">
          Create Auction
          <span class="heroAccent">
            {{ draftId ? "Editing draft" : "List your item" }}
          </span>
        </h1>
        <div class="heroActions">
          <button class="ghost" type="button" @click="goDrafts">
            View Drafts
          </button>
        </div>
      </div>
    </section>
    <section class="panel">
      <div v-if="!isLoggedIn" class="note">
        You must be signed in to create an auction.
        <div class="hint">You can still save drafts while signed out.</div>
      </div>
      <form class="form" @submit.prevent="submit">
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
            <div class="hint">Must be in the future when publishing.</div>
          </div>
        </div>
        <div class="rowBtns">
          <button class="ghost" type="button" @click="saveDraft">
            Save Draft
          </button>
          <button
            v-if="draftId"
            class="ghost dangerBtn"
            type="button"
            @click="deleteThisDraft"
          >
            Delete Draft
          </button>
        </div>
        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="ok" class="ok">{{ ok }}</div>
        <button class="primary" type="submit" :disabled="loading || !isLoggedIn">
          {{ loading ? "Creating..." : "Create Auction" }}
        </button>
        <div v-if="!isLoggedIn" class="hint">
          Sign in to publish to the API. Draft saving works without signing in.
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { api } from "../services/api";
import { getDraft, upsertDraft, deleteDraft } from "../services/drafts";

const router = useRouter();
const route = useRoute();
const isLoggedIn = computed(() => !!localStorage.getItem("session_token"));
const name = ref("");
const description = ref("");
const startingBid = ref("");
const endDateLocal = ref("");
const loading = ref(false);
const error = ref("");
const ok = ref("");
const draftId = ref("");

function toMsFromDatetimeLocal(v) {
  const d = new Date(v);
  const ms = d.getTime();
  return Number.isFinite(ms) ? ms : null;
}

function loadDraftIfAny() {
  const id = typeof route.query.draft === "string" ? route.query.draft : "";
  draftId.value = id;
  error.value = "";
  ok.value = "";
  if (!id) return;
  const d = getDraft(id);
  if (!d) {
    error.value = "Draft not found (it may have been deleted).";
    draftId.value = "";
    return;
  }
  name.value = d.name || "";
  description.value = d.description || "";
  startingBid.value = d.starting_bid ?? "";
  endDateLocal.value = d.end_date_local || "";
  ok.value = "Draft loaded.";
}

function saveDraft() {
  error.value = "";
  ok.value = "";
  const saved = upsertDraft({
    id: draftId.value || undefined,
    name: name.value,
    description: description.value,
    starting_bid: startingBid.value,
    end_date_local: endDateLocal.value,
  });
  draftId.value = saved.id;
  ok.value = "Draft saved locally.";
  router.replace({ path: "/create", query: { draft: saved.id } });
}

function deleteThisDraft() {
  if (!draftId.value) return;
  deleteDraft(draftId.value);
  draftId.value = "";
  name.value = "";
  description.value = "";
  startingBid.value = "";
  endDateLocal.value = "";
  ok.value = "Draft deleted.";
  router.replace({ path: "/create" });
}

function goDrafts() {
  router.push("/drafts");
}

async function submit() {
  error.value = "";
  ok.value = "";
  const n = name.value.trim();
  const d = description.value.trim();
  const sb = Math.floor(Number(startingBid.value));
  const endMs = toMsFromDatetimeLocal(endDateLocal.value);
  if (!isLoggedIn.value) {
    error.value = "Sign in to publish. (You can still Save Draft.)";
    return;
  }
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
      end_date: endMs,
    });
    const itemId = res?.data?.item_id;
    ok.value = "Auction created!";
    if (draftId.value) {
      deleteDraft(draftId.value);
      draftId.value = "";
    }
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

onMounted(loadDraftIfAny);
watch(() => route.query.draft, loadDraftIfAny);
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

.heroActions {
  margin-top: 14px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 18px;
  margin-top: 14px;
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

@media (max-width: 760px) {
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

.textarea {
  min-height: 110px;
  resize: vertical;
}

.rowBtns {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
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

.dangerBtn {
  border-color: rgba(255, 107, 107, 0.35);
}

.note {
  padding: 12px;
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.16);
  color: rgba(233, 238, 252, 0.75);
}

.hint {
  margin-top: 6px;
  color: rgba(233, 238, 252, 0.6);
  font-size: 12px;
}

.error {
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 107, 107, 0.35);
  background: rgba(255, 107, 107, 0.1);
  color: rgba(255, 220, 220, 0.95);
}

.ok {
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(46, 204, 113, 0.3);
  background: rgba(46, 204, 113, 0.1);
  color: rgba(210, 255, 230, 0.95);
}
</style>
