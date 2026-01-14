<template>
  <teleport to="body">
    <div class="overlay" @click.self="$emit('close')">
      <div class="modal" role="dialog" aria-modal="true">
        <header class="head">
          <h2 class="title">{{ title }}</h2>
          <button class="x" type="button" @click="$emit('close')" aria-label="Close">✕</button>
        </header>

        <div class="body">
          <slot />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
defineProps({
  title: { type: String, default: "" },
});
defineEmits(["close"]);
</script>

<style scoped>
.overlay{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(10px);
  display:flex;
  align-items:center;
  justify-content:center;
  padding: 18px;
  z-index: 999;
}
.modal{
  width: min(520px, 100%);
  border-radius: 22px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(10, 14, 24, 0.92);
  box-shadow: 0 30px 90px rgba(0,0,0,.45);
}
.head{
  padding: 14px 16px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.title{
  margin:0;
  font-size: 16px;
  font-weight: 900;
}
.x{
  width: 36px; height: 36px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.04);
  color: rgba(233,238,252,.85);
  cursor:pointer;
}
.x:hover{ border-color: rgba(46,204,113,.35); }
.body{ padding: 16px; }
</style>