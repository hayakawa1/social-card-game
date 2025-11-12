export * from './cn';

// Format currency with commas
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US');
}

// Calculate level from experience
export function calculateLevel(exp: number): number {
  // Formula: level = floor(sqrt(exp / 100)) + 1
  return Math.floor(Math.sqrt(exp / 100)) + 1;
}

// Calculate experience required for next level
export function expForNextLevel(currentLevel: number): number {
  // Formula: exp = (level)^2 * 100
  return currentLevel * currentLevel * 100;
}

// Calculate current stamina based on last update time
export function calculateCurrentStamina(
  currentStamina: number,
  maxStamina: number,
  lastUpdate: Date
): number {
  const now = Date.now();
  const lastUpdateTime = new Date(lastUpdate).getTime();
  const minutesPassed = Math.floor((now - lastUpdateTime) / (1000 * 60));

  // 5 minutes = 1 stamina
  const recoveredStamina = Math.floor(minutesPassed / 5);
  return Math.min(currentStamina + recoveredStamina, maxStamina);
}

// Format time remaining for stamina recovery
export function formatStaminaRecoveryTime(
  currentStamina: number,
  maxStamina: number
): string {
  if (currentStamina >= maxStamina) {
    return 'Full';
  }

  const staminaNeeded = maxStamina - currentStamina;
  const minutesNeeded = staminaNeeded * 5;
  const hours = Math.floor(minutesNeeded / 60);
  const minutes = minutesNeeded % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Get rarity color
export function getRarityColor(
  rarity: 'common' | 'rare' | 'super_rare' | 'ultra_rare'
): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-500';
    case 'rare':
      return 'text-blue-500';
    case 'super_rare':
      return 'text-purple-500';
    case 'ultra_rare':
      return 'text-yellow-500';
    default:
      return 'text-gray-500';
  }
}

// Get attribute color
export function getAttributeColor(
  attribute: 'fire' | 'water' | 'earth' | 'wind' | 'light' | 'dark'
): string {
  switch (attribute) {
    case 'fire':
      return 'text-red-500';
    case 'water':
      return 'text-blue-500';
    case 'earth':
      return 'text-green-500';
    case 'wind':
      return 'text-cyan-500';
    case 'light':
      return 'text-yellow-400';
    case 'dark':
      return 'text-purple-700';
    default:
      return 'text-gray-500';
  }
}
