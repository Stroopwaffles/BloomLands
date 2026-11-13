import type { Component } from 'svelte'

/**
 * Real art, looked up by stable asset ID (content doc → Asset List → Conventions).
 * Until an ID has an entry here, the game draws a placeholder for it automatically.
 * Adding finished art is just adding an entry: no game code changes.
 */
export const ART: Record<string, Component<{ size: number }>> = {}

export function getArt(id: string): Component<{ size: number }> | null {
  return ART[id] ?? null
}

/** Stable color for a placeholder, so the same asset always looks the same. */
export function placeholderHue(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return Math.abs(hash) % 360
}

export type PlaceholderShape = 'circle' | 'figure' | 'oval' | 'square'

/** Picks a placeholder shape from the asset ID's category prefix. */
export function placeholderShape(id: string): PlaceholderShape {
  const category = id.split('-')[0]
  if (category === 'plant') return 'circle'
  if (category === 'char' || category === 'npc' || category === 'spirit') return 'figure'
  if (category === 'mount' || category === 'creature') return 'oval'
  return 'square'
}
