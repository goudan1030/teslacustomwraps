export const FREE_GENERATION_LIMIT = 5;

const STORAGE_PREFIX = 'free_generation_usage:';

const getStorageKey = (userId: string) => `${STORAGE_PREFIX}${userId}`;

export const getUsedGenerations = (userId: string | null | undefined): number => {
  if (!userId) {
    return 0;
  }

  const raw = localStorage.getItem(getStorageKey(userId));
  const used = raw ? Number.parseInt(raw, 10) : 0;

  if (Number.isNaN(used) || used < 0) {
    return 0;
  }

  return used;
};

export const getRemainingGenerations = (userId: string | null | undefined): number => {
  return Math.max(FREE_GENERATION_LIMIT - getUsedGenerations(userId), 0);
};

export const consumeGeneration = (userId: string): number => {
  const nextUsed = Math.min(getUsedGenerations(userId) + 1, FREE_GENERATION_LIMIT);
  localStorage.setItem(getStorageKey(userId), String(nextUsed));
  return Math.max(FREE_GENERATION_LIMIT - nextUsed, 0);
};
