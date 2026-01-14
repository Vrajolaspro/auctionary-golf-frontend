<template>
  <div class="wrap">
    <section class="hero">
      <div class="heroInner">
        <h1 class="heroTitle">
          Drafts
          <span class="heroAccent">Saved locally</span>
        </h1>
      </div>
    </section>
    <section class="panel">
      <div class="panelHead">
        <h2 class="h2">Your drafts</h2>
        <span class="count">{{ drafts.length }}</span>
      </div>
      <div v-if="drafts.length === 0" class="note">
        No drafts yet. Create one from “Create Auction” and click “Save Draft”.
      </div>
      <div v-else class="list">
        <div class="row" v-for="d in drafts" :key="d.id">
          <div class="left">
            <div class="titleRow">
              <div class="rowTitle">{{ d.name || "Untitled draft" }}</div>
              <div class="pill">Draft</div>
            </div>
            <div class="rowSub">
              Updated: {{ formatTime(d.updatedAt) }}
              <span class="sep">•</span>
              Starting bid: £{{ safeNum(d.starting_bid) }}
              <span class="sep">•</span>
              End: {{ d.end_date_local || "Not set" }}
            </div>
          </div>
          <div class="actions">
            <button class="primarySmall" @click="editDraft(d.id)">Edit</button>
            <button class="ghostSmall dangerBtn" @click="removeDraft(d.id)">Delete</button>
          </div>
        </div>
      </div>
      <div class="footerRow">
        <button class="ghost" @click="goCreate">Create New Auction</button>
        <button class="ghost dangerBtn" v-if="drafts.length" @click="clearAll">
          Delete all drafts
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { listDrafts, deleteDraft, clearDrafts } from "../services/drafts";

const router = useRouter();
const drafts = ref([]);

function load() {
  drafts.value = listDrafts();
}

function editDraft(id) {
  router.push(`/create?draft=${encodeURIComponent(id)}`);
}

function removeDraft(id) {
  deleteDraft(id);
  load();
}

function clearAll() {
  clearDrafts();
  load();
}

function goCreate() {
  router.push("/create");
}

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatTime(ms) {
  const d = new Date(Number(ms));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
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

.note {
  padding: 12px;
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.16);
  color: rgba(233, 238, 252, 0.75);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}

.left {
  min-width: 0;
}

.titleRow {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rowTitle {
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 620px;
}

.rowSub {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(233, 238, 252, 0.7);
}

.sep {
  margin: 0 6px;
  opacity: 0.7;
}

.pill {
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.25);
  font-size: 12px;
  font-weight: 800;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.primarySmall {
  padding: 10px 12px;
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

.ghostSmall {
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(233, 238, 252, 0.85);
  cursor: pointer;
}

.dangerBtn {
  border-color: rgba(255, 107, 107, 0.35);
}

.footerRow {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
