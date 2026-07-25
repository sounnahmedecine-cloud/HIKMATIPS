// --- Jardin de la sagesse ---
// Système de croissance douce : chaque interaction bénéfique nourrit le jardin.
// Pas de score visible, pas de régression en cas d'inactivité.

export type GardenActionType = 'daily_open' | 'read_hikma' | 'generate_image' | 'share' | 'favorite' | 'time_spent';

export interface GardenState {
  xp: number;
  stage: number;
  lastGrownAt: string | null;
  lastDailyOpenDate: string;
  dailyReadCount: number;
  dailyReadDate: string;
  favoritedIds: string[];
  dailyTimeTicks: number;
  dailyTimeDate: string;
  name: string | null;
  namePromptShown: boolean;
}

export interface StageInfo {
  key: string;
  label: string;
  assetPath: string;
}

const GARDEN_KEY = 'hikma_garden';
const DAILY_READ_CAP = 10;
const DAILY_TIME_TICK_CAP = 12; // 12 x 5 min = 60 min de lumière max par jour

const STAGE_THRESHOLDS = [0, 20, 50, 100, 180, 300, 450];

const STAGES: StageInfo[] = [
  { key: 'seed', label: 'Graine', assetPath: '/assets/garden/stage-0.png' },
  { key: 'sprout', label: 'Pousse', assetPath: '/assets/garden/stage-1.png' },
  { key: 'young_sprout', label: 'Jeune pousse', assetPath: '/assets/garden/stage-2.png' },
  { key: 'shrub', label: 'Arbrisseau', assetPath: '/assets/garden/stage-3.png' },
  { key: 'young_tree', label: 'Jeune arbre', assetPath: '/assets/garden/stage-4.png' },
  { key: 'flowering_tree', label: 'Arbre en fleurs', assetPath: '/assets/garden/stage-5.png' },
  { key: 'glowing_tree', label: 'Arbre lumineux', assetPath: '/assets/garden/stage-6.png' },
];

const ACTION_XP: Record<GardenActionType, number> = {
  daily_open: 15,
  read_hikma: 2,
  favorite: 5,
  share: 10,
  generate_image: 8,
  time_spent: 5,
};

const STAGE_MESSAGES = [
  'Ta lumière a fait germer une racine.',
  'Une nouvelle feuille capte la lumière.',
  'Ton arbre grandit, nourri par ta lumière.',
  'Une branche s’est développée grâce à ta constance.',
  'Ton jardin rayonne d’une lumière nouvelle.',
  'Les premières fleurs s’ouvrent à la lumière.',
  'Ton jardin est baigné de lumière.',
];

const LIGHT_GAINED_MESSAGES = [
  'Tu as gagné de la lumière aujourd’hui.',
  'Un peu plus de lumière pour ton jardin.',
  'Ta constance nourrit ton jardin de lumière.',
];

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function defaultState(): GardenState {
  const today = getToday();
  return {
    xp: 0,
    stage: 0,
    lastGrownAt: null,
    lastDailyOpenDate: '',
    dailyReadCount: 0,
    dailyReadDate: today,
    favoritedIds: [],
    dailyTimeTicks: 0,
    dailyTimeDate: today,
    name: null,
    namePromptShown: false,
  };
}

export function setGardenName(name: string): GardenState {
  const state = getGardenState();
  state.name = name.trim().slice(0, 24) || null;
  state.namePromptShown = true;
  saveGardenState(state);
  return state;
}

export function markNamePromptShown(): GardenState {
  const state = getGardenState();
  state.namePromptShown = true;
  saveGardenState(state);
  return state;
}

export const GARDEN_GROW_EVENT = 'hikma:garden-grow';
export type GardenGrowEvent = GrowResult;

export function getGardenState(): GardenState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = localStorage.getItem(GARDEN_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

function saveGardenState(state: GardenState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GARDEN_KEY, JSON.stringify(state));
  } catch {}
}

export function getCurrentStage(xp: number): number {
  let stage = 0;
  for (let i = 0; i < STAGE_THRESHOLDS.length; i++) {
    if (xp >= STAGE_THRESHOLDS[i]) stage = i;
  }
  return stage;
}

export function getStageInfo(stage: number): StageInfo {
  const clamped = Math.max(0, Math.min(stage, STAGES.length - 1));
  return STAGES[clamped];
}

export function getStageCount(): number {
  return STAGES.length;
}

export interface GrowResult {
  state: GardenState;
  xpGained: number;
  grew: boolean;
  stageChanged: boolean;
  message: string | null;
}

export function growGarden(action: GardenActionType, meta?: { hikmaId?: string }): GrowResult {
  const state = getGardenState();
  const today = getToday();
  const previousStage = getCurrentStage(state.xp);
  let xpGained = 0;

  if (state.dailyReadDate !== today) {
    state.dailyReadDate = today;
    state.dailyReadCount = 0;
  }
  if (state.dailyTimeDate !== today) {
    state.dailyTimeDate = today;
    state.dailyTimeTicks = 0;
  }

  switch (action) {
    case 'daily_open': {
      if (state.lastDailyOpenDate !== today) {
        state.lastDailyOpenDate = today;
        xpGained = ACTION_XP.daily_open;
      }
      break;
    }
    case 'read_hikma': {
      if (state.dailyReadCount < DAILY_READ_CAP) {
        state.dailyReadCount += 1;
        xpGained = ACTION_XP.read_hikma;
      }
      break;
    }
    case 'favorite': {
      const id = meta?.hikmaId;
      if (id && !state.favoritedIds.includes(id)) {
        state.favoritedIds.push(id);
        xpGained = ACTION_XP.favorite;
      }
      break;
    }
    case 'share': {
      xpGained = ACTION_XP.share;
      break;
    }
    case 'generate_image': {
      xpGained = ACTION_XP.generate_image;
      break;
    }
    case 'time_spent': {
      if (state.dailyTimeTicks < DAILY_TIME_TICK_CAP) {
        state.dailyTimeTicks += 1;
        xpGained = ACTION_XP.time_spent;
      }
      break;
    }
  }

  if (xpGained > 0) {
    state.xp += xpGained;
    state.lastGrownAt = new Date().toISOString();
  }

  saveGardenState(state);

  const newStage = getCurrentStage(state.xp);
  const stageChanged = newStage > previousStage;

  let message: string | null = null;
  if (stageChanged) {
    message = STAGE_MESSAGES[newStage] ?? null;
  } else if ((action === 'daily_open' || action === 'time_spent') && xpGained > 0) {
    message = LIGHT_GAINED_MESSAGES[Math.floor(Math.random() * LIGHT_GAINED_MESSAGES.length)];
  }

  const result: GrowResult = {
    state,
    xpGained,
    grew: xpGained > 0,
    stageChanged,
    message,
  };

  if (result.grew && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(GARDEN_GROW_EVENT, { detail: result }));
  }

  return result;
}
