<template>
  <div class="chapter-graph-simple-vertical graph-scrollable">
    <svg v-if="edges.length" class="graph-svg" :width="svgWidth" :height="svgHeight">
      <line v-for="edge in edges" :key="edge.id"
        :x1="edge.x1" :y1="edge.y1" :x2="edge.x2" :y2="edge.y2"
        stroke="var(--accent-secondary)" stroke-width="3" marker-end="url(#arrow)" />
      <defs>
        <marker id="arrow" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L12,6 L0,12" fill="var(--accent-secondary)" />
        </marker>
      </defs>
    </svg>
    <div class="graph-rows">
      <div v-for="(level, rowIdx) in levels" :key="rowIdx" class="graph-row">
        <div v-for="chapter in level" :key="chapter.id" class="chapter-node"
             :class="{ clickable: true }"
             :style="nodeStyle(chapter.id)"
             @click="$emit('select', chapter.id)">
          <div class="chapter-number">{{ chapter.number }}</div>
          <div class="chapter-label">{{ chapter.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Chapter } from '../types';

const props = defineProps<{ chapters: Chapter[] }>();
const emit = defineEmits<{ (e: 'select', id: string): void }>();

function findRoots(chapters: Chapter[]) {
  const allNext = new Set(chapters.flatMap(ch => ch.next));
  return chapters.filter(ch => !allNext.has(ch.id));
}

function buildLevels(chapters: Chapter[]) {
  const levels: Chapter[][] = [];
  const visited = new Set<string>();
  let current = findRoots(chapters);
  while (current.length) {
    levels.push(current);
    visited.add(...current.map(ch => ch.id));
    const nextLevel: Chapter[] = [];
    for (const ch of current) {
      for (const nextId of ch.next) {
        const nextCh = chapters.find(c => c.id === nextId && !visited.has(c.id));
        if (nextCh && !nextLevel.includes(nextCh)) nextLevel.push(nextCh);
      }
    }
    current = nextLevel;
  }
  return levels;
}

const levels = computed(() => buildLevels(props.chapters));

// Positionnement vertical
const nodePositions = computed(() => {
  const pos: Record<string, { x: number; y: number }> = {};
  const rowHeight = 120, colWidth = 220;
  levels.value.forEach((level, rowIdx) => {
    const totalWidth = (level.length - 1) * colWidth;
    level.forEach((ch, colIdx) => {
      pos[ch.id] = {
        x: (colWidth * colIdx) + (svgWidth.value - totalWidth) / 2,
        y: rowIdx * rowHeight + 60
      };
    });
  });
  return pos;
});

const edges = computed(() => {
  const arr: { id: string; x1: number; y1: number; x2: number; y2: number }[] = [];
  for (const ch of props.chapters) {
    for (const nextId of ch.next) {
      if (nodePositions.value[ch.id] && nodePositions.value[nextId]) {
        arr.push({
          id: ch.id + '->' + nextId,
          x1: nodePositions.value[ch.id].x + 100,
          y1: nodePositions.value[ch.id].y + 60,
          x2: nodePositions.value[nextId].x + 100,
          y2: nodePositions.value[nextId].y
        });
      }
    }
  }
  return arr;
});

const svgWidth = computed(() => {
  // Largeur max de la ligne la plus longue
  return Math.max(...levels.value.map(level => (level.length - 1) * 220 + 220), 500);
});
const svgHeight = computed(() => (levels.value.length * 120) + 120);

function nodeStyle(id: string) {
  const pos = nodePositions.value[id];
  return pos ? { left: pos.x + 'px', top: pos.y + 'px', width: '200px' } : {};
}
</script>

<style scoped>
.chapter-graph-simple-vertical {
  position: relative;
  min-height: 350px;
  height: 400px;
  background: repeating-linear-gradient(135deg, #232323 0 2px, transparent 2px 40px), var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  margin-top: 1.5rem;
  overflow: auto;
  width: 100%;
  max-width: 100%;
}
.graph-scrollable {
  overflow-x: auto;
  overflow-y: auto;
  scrollbar-width: thin;
}
.graph-svg {
  position: absolute;
  left: 0; top: 0;
  z-index: 1;
  pointer-events: none;
}
.graph-rows {
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 2;
  height: 100%;
  width: 100%;
}
.graph-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  gap: 40px;
  min-height: 120px;
  width: 100%;
}
.chapter-node {
  position: absolute;
  width: 200px;
  min-width: 200px;
  background: linear-gradient(135deg, var(--card-bg) 80%, var(--accent-secondary) 120%);
  color: var(--text-primary);
  border: 3px solid var(--accent-primary);
  border-radius: 12px;
  font-weight: bold;
  padding: 12px 16px 10px 16px;
  box-shadow: 0 4px 18px 0 rgba(0,0,0,0.22);
  cursor: pointer;
  transition: border 0.2s, box-shadow 0.2s, background 0.2s;
  user-select: none;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.chapter-node:hover {
  border: 3px solid var(--accent-secondary);
  box-shadow: 0 0 16px var(--accent-secondary);
  background: linear-gradient(135deg, var(--accent-primary) 60%, var(--card-bg) 120%);
  color: white;
}
.chapter-number {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--accent-primary);
  margin-bottom: 2px;
}
.chapter-label {
  font-size: 1rem;
  text-align: center;
  word-break: break-word;
  font-weight: 500;
}
@media (max-width: 900px) {
  .chapter-graph-simple-vertical {
    min-width: 300px;
    height: 300px;
  }
  .chapter-node {
    width: 120px;
    min-width: 80px;
    font-size: 0.9rem;
    padding: 6px 8px;
  }
}
</style> 