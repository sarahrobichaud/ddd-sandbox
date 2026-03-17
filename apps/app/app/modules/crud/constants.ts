export const Entity = ['plane', 'fleet'] as const;
export type EntityName = (typeof Entity)[number];
