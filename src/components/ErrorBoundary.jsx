import { Component } from 'react'

/**
 * 错误边界：捕获子组件渲染异常（如 WebGL 不可用），
 * 失败时渲染 fallback 而不是整页崩溃。
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(err) {
    // 静默吞掉 WebGL 等环境异常
    if (this.props.onError) this.props.onError(err)
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}
