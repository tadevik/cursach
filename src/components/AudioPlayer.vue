<template>
  <div class="column">
    <div id="seek" class="row">
      <div class="col-1 q-pl-xs">
        {{ curTime }}
      </div>
      <div class="player-timeline col" style="min-height: 20px">
        <div :style="curWidth" class="player-progress"></div>
        <div v-on:click="seek" class="player-seeker"></div>
      </div>
      <div class="col-1 text-right q-pr-xs">
        {{ getDuration() }}
      </div>
    </div>
    <div class="col row">
      <q-btn
        @click="play()"
        flat
        :title="playing ? 'Остановить' : 'Запустить'"
        :icon="playing ? 'pause' : 'play_arrow'"
        class="col-2"
      >
      </q-btn>
      <input
        v-model="audio.volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        class="col-8"
      />
      <div class="col-1 self-center q-ml-sm">
        {{ Math.round(audio.volume * 100) }} %
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getTimeFromSeconds } from './models';

const props = defineProps({
  file: { type: String, required: true },
});
defineExpose({
  stopPlaying,
  getTimeInSeconds,
  changeTime,
});
const audio = new Audio(props.file);

const playing = ref(false);

function play() {
  playing.value = !playing.value;
  playing.value ? audio.play() : audio.pause();
}
function changeTime(time: number) {
  audio.currentTime = time;
  progressStyle();
  getCurrentTime();
}

const curTime = ref('00:00');
function getTimeInSeconds() {
  return audio.currentTime;
}
function getCurrentTime() {
  curTime.value = getTimeFromSeconds(audio.currentTime);
}
function getDuration() {
  return getTimeFromSeconds(audio.duration);
}
const timeInterval = setInterval(getCurrentTime, 1000);

const curWidth = ref({});
function progressStyle() {
  curWidth.value = `width: ${(audio.currentTime / audio.duration) * 100}%`;
}
const progInterval = setInterval(progressStyle, 50);

function seek(e: MouseEvent) {
  if (!e.target) return;
  const node = e.target as HTMLElement;

  const bounds = node.getBoundingClientRect();
  const seekPos = (e.clientX - bounds.left) / bounds.width;

  audio.currentTime = audio.duration * seekPos;
  progressStyle();
  getCurrentTime();
}

function stopPlaying() {
  audio.pause();
  clearInterval(progInterval);
  clearInterval(timeInterval);
}
</script>

<style lang="scss">
$player-bg: #fff;
$player-border-color: darken($player-bg, 12%);
$player-link-color: darken($player-bg, 75%);
$player-progress-color: $player-link-color;
$player-text-color: $player-link-color;
$player-timeline-color: $player-border-color;

.player-wrapper {
  align-items: center;
  background-color: $player-bg;
  // background-image: linear-gradient(90deg, #fff 0, darken(#fff, 12%));
  display: flex;
  height: 100vh;
  justify-content: center;
}

.player {
  background-color: $player-bg;
  border-radius: 0.3125rem;
  border: 1px solid $player-border-color;
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.15);
  color: $player-text-color;
  display: inline-block;
  line-height: 1.5625;
  position: relative;
}

.player-controls {
  display: grid;
  grid-template-areas: 'a b c d e f g';
  max-width: 31.25rem;

  > div {
    border-right: 1px solid $player-border-color;

    &:last-child {
      border-right: none;
    }
  }
}

.player-control {
  background-color: white;
  border: none;
  color: $player-link-color;
  cursor: pointer;
  display: flex;
  line-height: 0;
  margin: 0;
  padding: 1em;
  text-decoration: none;

  > svg {
    width: 1.125rem;
  }
}

.player-timeline {
  background-color: $player-timeline-color;
  height: 50%;
  max-width: 12.8125rem;
  position: relative;

  .player-progress,
  .player-seeker {
    bottom: 0;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    transition: width 0.05s;
  }

  .player-progress {
    background-color: $player-progress-color;
    z-index: 1;
  }

  .player-seeker {
    cursor: pointer;
    width: 100%;
    z-index: 2;
  }
}

.player-time {
  display: flex;
  justify-content: space-between;

  .player-time-current {
    font-weight: 700;
    padding: 0 0.3125rem;
  }

  .player-title {
    display: flex;
    mask-image: linear-gradient(
      90deg,
      hsla(0, 0, 0, 0) 0%,
      hsla(0, 0, 0, 1) 25%,
      hsla(0, 0, 0, 1) 75%,
      hsla(0, 0, 0, 0) 100%
    );
    flex-grow: 1;
    max-width: 6rem;
    overflow: hidden;

    p {
      animation: slide-x 10s linear infinite;
      white-space: nowrap;

      @keyframes slide-x {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-100%);
        }
      }
    }
  }

  .player-time-total {
    opacity: 0.5;
    padding: 0 0.3125rem;
  }
}

.player-volume {
  display: inline-block;
  height: 1.1rem;
  margin: 0 0 0 0.625rem;
  width: 7.925rem;
}
</style>
