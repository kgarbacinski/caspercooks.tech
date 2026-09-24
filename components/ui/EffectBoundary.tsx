'use client'

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** co pokazać zamiast efektu, gdy się wysypie (np. statyczny obraz pokoju); domyślnie nic */
  fallback?: ReactNode
  /** zmiana klucza (np. motyw DEV ⇄ CEO) daje efektowi kolejną szansę */
  resetKey?: string | number
  name?: string
}

/**
 * Granica błędów wokół ciężkich efektów (diorama, WebGL, animacje pokoi): wyjątek w efekcie
 * nigdy nie wywala całej strony („Application error”) — zamiast efektu zostaje statyczny obraz.
 */
export default class EffectBoundary extends Component<Props, { failed: boolean; key?: string | number }> {
  state = { failed: false, key: this.props.resetKey }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  static getDerivedStateFromProps(p: Props, s: { failed: boolean; key?: string | number }) {
    return p.resetKey !== s.key ? { failed: false, key: p.resetKey } : null
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(`[effect:${this.props.name ?? '?'}] wyłączony po błędzie:`, error, info.componentStack?.split('\n').slice(0, 4).join('\n'))
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children
  }
}
