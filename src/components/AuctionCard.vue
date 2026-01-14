<template>
  <article class="card">
    <div class="content">
      <div class="topline">
        <div class="badge">LIVE</div>
        <div class="idPill">#{{ item.item_id }}</div>
      </div>
      <h3 class="name">{{ item.name }}</h3>
      <p class="desc">{{ item.description }}</p>
      <div class="metaRow">
        <div>
          <div class="label">Seller</div>
          <div class="value">{{ item.first_name }} {{ item.last_name }}</div>
        </div>
        <div class="right">
          <div class="label">Ends</div>
          <div class="value" :class="{ ended: endsIn === 'Ended' }">{{ endsIn }}</div>
        </div>
      </div>
      <button class="cta" type="button">
        View Auction →
      </button>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  item: { type: Object, required: true },
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

const endsIn = computed(() => formatCountdown(props.item.end_date));
</script>

<style scoped>
.card{
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}
.card:hover{
  transform: translateY(-6px);
  border-color: rgba(46,204,113,.35);
  background: var(--panel2);
  box-shadow: 0 18px 50px rgba(46,204,113,.12);
}
.content{ padding: 16px; }
.topline{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.badge{
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(46,204,113,.16);
  border: 1px solid rgba(46,204,113,.30);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .4px;
}
.idPill{
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0,0,0,.25);
  border: 1px solid rgba(255,255,255,.12);
  font-size: 12px;
}
.name{
  margin: 0;
  font-size: 18px;
  font-weight: 900;
}
.desc{
  margin: 8px 0 14px;
  color: rgba(233,238,252,.72);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 38px;
}
.metaRow{
  display:flex;
  justify-content:space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,.08);
  margin-bottom: 12px;
}
.label{ font-size: 12px; color: rgba(233,238,252,.55); }
.value{ font-size: 13px; color: rgba(233,238,252,.92); }
.right{ text-align:right; }
.ended{ color: rgba(255,107,107,.95); }
.cta{
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(46,204,113,.30);
  background: linear-gradient(90deg, rgba(46,204,113,.95), rgba(59,130,246,.95));
  color: white;
  font-weight: 800;
  cursor:pointer;
}
.cta:hover{
  box-shadow: 0 16px 40px rgba(46,204,113,.18);
}
</style>