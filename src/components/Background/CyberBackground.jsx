import { useEffect, useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'

/* ============================================================
   俯瞰海洋背景（Canvas + Boids 群体算法）
   - 真实鱼群行为：分离 / 对齐 / 凝聚
   - 贝塞尔曲线绘制有机鱼形（带尾鳍、背鳍）
   - 鲸鱼：大块头缓慢游动
   - 向下滚动 → 鱼群整体上移（鱼往上游）
   ============================================================ */

// ====== 鱼形绘制（俯瞰，鱼头朝上） ======
function drawFish(ctx, fish, isLight) {
  const { x, y, angle, size, color, alpha } = fish
  // angle: 0 = 朝上（屏幕 -y 方向）
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.globalAlpha = alpha

  const s = size
  // 鱼身（贝塞尔纺锤形，头在上尾在下）
  ctx.beginPath()
  ctx.moveTo(0, -s)                  // 鱼头尖端
  ctx.bezierCurveTo(s * 0.55, -s * 0.5, s * 0.5, s * 0.4, 0, s * 0.7)   // 右侧身
  ctx.bezierCurveTo(-s * 0.5, s * 0.4, -s * 0.55, -s * 0.5, 0, -s)      // 左侧身回到头
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()

  // 鱼尾（三角分叉）
  ctx.beginPath()
  ctx.moveTo(0, s * 0.55)
  ctx.lineTo(-s * 0.4, s * 1.1)
  ctx.lineTo(0, s * 0.95)
  ctx.lineTo(s * 0.4, s * 1.1)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()

  // 背部高光（让鱼有立体感）
  ctx.beginPath()
  ctx.ellipse(0, -s * 0.2, s * 0.18, s * 0.4, 0, 0, Math.PI * 2)
  ctx.fillStyle = isLight ? 'rgba(255,255,255,0.35)' : 'rgba(180,220,255,0.2)'
  ctx.fill()

  // 眼睛
  ctx.beginPath()
  ctx.arc(0, -s * 0.55, Math.max(1, s * 0.08), 0, Math.PI * 2)
  ctx.fillStyle = isLight ? 'rgba(255,255,255,0.8)' : 'rgba(150,220,255,0.85)'
  ctx.fill()

  ctx.restore()
}

// 鲸鱼绘制（更大、更圆润）
function drawWhale(ctx, whale, isLight) {
  const { x, y, angle, size, color, alpha } = whale
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.globalAlpha = alpha
  const s = size

  // 鲸鱼身体（圆胖纺锤）
  ctx.beginPath()
  ctx.moveTo(0, -s)
  ctx.bezierCurveTo(s * 0.7, -s * 0.6, s * 0.65, s * 0.5, 0, s * 0.8)
  ctx.bezierCurveTo(-s * 0.65, s * 0.5, -s * 0.7, -s * 0.6, 0, -s)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()

  // 尾鳍（水平宽大）
  ctx.beginPath()
  ctx.moveTo(0, s * 0.65)
  ctx.bezierCurveTo(-s * 0.7, s * 1.1, -s * 0.5, s * 1.3, -s * 0.35, s * 1.2)
  ctx.lineTo(0, s * 0.95)
  ctx.lineTo(s * 0.35, s * 1.2)
  ctx.bezierCurveTo(s * 0.5, s * 1.3, s * 0.7, s * 1.1, 0, s * 0.65)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()

  // 背脊高光
  ctx.beginPath()
  ctx.ellipse(0, -s * 0.15, s * 0.25, s * 0.55, 0, 0, Math.PI * 2)
  ctx.fillStyle = isLight ? 'rgba(255,255,255,0.25)' : 'rgba(180,220,255,0.15)'
  ctx.fill()

  // 眼睛
  ctx.beginPath()
  ctx.arc(0, -s * 0.6, Math.max(1.5, s * 0.05), 0, Math.PI * 2)
  ctx.fillStyle = isLight ? 'rgba(255,255,255,0.7)' : 'rgba(150,220,255,0.8)'
  ctx.fill()

  ctx.restore()
}

// ====== Boids 鱼群类 ======
class Fish {
  constructor(canvas, opts) {
    this.canvas = canvas
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    // 速度向量，主要朝上（-y）
    this.vx = (Math.random() - 0.5) * 0.5
    this.vy = -0.5 - Math.random() * 0.8
    this.size = opts.size + Math.random() * opts.sizeVar
    this.color = opts.colors[Math.floor(Math.random() * opts.colors.length)]
    this.alpha = opts.alpha
    this.maxSpeed = opts.maxSpeed
    this.maxForce = opts.maxForce
    this.perception = opts.perception
    this.tailPhase = Math.random() * Math.PI * 2
  }

  // Boids 三规则
  flock(fishes) {
    let sepX = 0, sepY = 0, sepCount = 0
    let aliX = 0, aliY = 0, aliCount = 0
    let cohX = 0, cohY = 0, cohCount = 0

    for (const other of fishes) {
      if (other === this) continue
      const dx = other.x - this.x
      const dy = other.y - this.y
      const d = Math.hypot(dx, dy)
      if (d < this.perception && d > 0) {
        // 对齐
        aliX += other.vx
        aliY += other.vy
        aliCount++
        // 凝聚
        cohX += other.x
        cohY += other.y
        cohCount++
        // 分离
        if (d < this.perception * 0.4) {
          sepX -= dx / d
          sepY -= dy / d
          sepCount++
        }
      }
    }

    let ax = 0, ay = 0
    if (aliCount > 0) {
      aliX /= aliCount; aliY /= aliCount
      const mag = Math.hypot(aliX, aliY) || 1
      aliX = (aliX / mag) * this.maxSpeed - this.vx
      aliY = (aliY / mag) * this.maxSpeed - this.vy
      ax += aliX * 0.8
      ay += aliY * 0.8
    }
    if (cohCount > 0) {
      cohX = cohX / cohCount - this.x
      cohY = cohY / cohCount - this.y
      const mag = Math.hypot(cohX, cohY) || 1
      cohX = (cohX / mag) * this.maxSpeed - this.vx
      cohY = (cohY / mag) * this.maxSpeed - this.vy
      ax += cohX * 0.4
      ay += cohY * 0.4
    }
    if (sepCount > 0) {
      sepX /= sepCount; sepY /= sepCount
      const mag = Math.hypot(sepX, sepY) || 1
      sepX = (sepX / mag) * this.maxSpeed - this.vx
      sepY = (sepY / mag) * this.maxSpeed - this.vy
      ax += sepX * 1.2
      ay += sepY * 1.2
    }

    // 限制力
    const fmag = Math.hypot(ax, ay)
    if (fmag > this.maxForce) {
      ax = (ax / fmag) * this.maxForce
      ay = (ay / fmag) * this.maxForce
    }
    this.vx += ax
    this.vy += ay

    // 限速
    const smag = Math.hypot(this.vx, this.vy)
    if (smag > this.maxSpeed) {
      this.vx = (this.vx / smag) * this.maxSpeed
      this.vy = (this.vy / smag) * this.maxSpeed
    }
  }

  update(canvas, scrollOffset) {
    this.x += this.vx
    this.y += this.vy + scrollOffset
    this.tailPhase += 0.3

    // 边界环绕（左右上下）
    if (this.x < -50) this.x = canvas.width + 50
    if (this.x > canvas.width + 50) this.x = -50
    if (this.y < -150) this.y = canvas.height + 150
    if (this.y > canvas.height + 150) this.y = -150
  }

  draw(ctx, isLight) {
    // angle: atan2(vx, -vy) 让鱼头朝速度方向，速度朝上时 angle=0 头朝上
    const angle = Math.atan2(this.vx, -this.vy)
    // 尾巴摆动 → size 微调
    const tailWobble = 1 + Math.sin(this.tailPhase) * 0.04
    drawFish(ctx, { ...this, size: this.size * tailWobble }, isLight)
  }
}

// 鲸鱼（不参与 flocking，单独漫游）
class Whale {
  constructor(canvas, opts) {
    this.canvas = canvas
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.vx = (Math.random() - 0.5) * 0.3
    this.vy = -0.15 - Math.random() * 0.2
    this.size = opts.size
    this.color = opts.color
    this.alpha = opts.alpha
    this.wanderTheta = Math.random() * Math.PI * 2
  }
  update(canvas, scrollOffset) {
    // 缓慢漫游
    this.wanderTheta += (Math.random() - 0.5) * 0.05
    this.vx += Math.cos(this.wanderTheta) * 0.005
    this.vy += Math.sin(this.wanderTheta) * 0.005 - 0.001 // 轻微上浮趋势
    // 限速
    const mag = Math.hypot(this.vx, this.vy) || 1
    const maxSpd = 0.35
    if (mag > maxSpd) {
      this.vx = (this.vx / mag) * maxSpd
      this.vy = (this.vy / mag) * maxSpd
    }
    this.x += this.vx
    this.y += this.vy + scrollOffset
    // 边界环绕
    if (this.x < -200) this.x = canvas.width + 200
    if (this.x > canvas.width + 200) this.x = -200
    if (this.y < -300) this.y = canvas.height + 300
    if (this.y > canvas.height + 300) this.y = -300
  }
  draw(ctx, isLight) {
    const angle = Math.atan2(this.vx, -this.vy)
    drawWhale(ctx, { ...this, angle }, isLight)
  }
}

export default function CyberBackground() {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 50, damping: 28, mass: 0.9 })

  // 滚动上移量（鱼往上游）
  const bgY = useTransform(smooth, [0, 1], [0, -300])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf = 0
    let isLight = document.documentElement.classList.contains('theme-light')

    // 颜色配置
    const palette = () => isLight
      ? { fish: ['#0a3548', '#1a4a5e', '#2c5f7e', '#3d6b8a'], whale: '#0a2538', whaleAlpha: 0.55, fishAlpha: 0.65 }
      : { fish: ['#1a4a6b', '#2c5f82', '#3d7a9e', '#5d9fc8'], whale: '#0a1525', whaleAlpha: 0.7, fishAlpha: 0.7 }

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const pal = palette()
      // 小鱼群（3 群，每群 ~20 条）
      const schools = []
      const schoolCount = 3
      for (let i = 0; i < schoolCount; i++) {
        const group = []
        const centerX = (i + 0.5) * (w / schoolCount) + (Math.random() - 0.5) * 100
        const centerY = (i + 0.5) * (h / schoolCount) + (Math.random() - 0.5) * 100
        const count = 18 + Math.floor(Math.random() * 8)
        for (let j = 0; j < count; j++) {
          const f = new Fish({ width: w, height: h }, {
            size: 7 + Math.random() * 4,
            sizeVar: 3,
            colors: pal.fish,
            alpha: pal.fishAlpha,
            maxSpeed: 1.2 + Math.random() * 0.4,
            maxForce: 0.04,
            perception: 60,
          })
          // 初始聚集
          f.x = centerX + (Math.random() - 0.5) * 80
          f.y = centerY + (Math.random() - 0.5) * 80
          group.push(f)
        }
        schools.push(group)
      }
      // 鲸鱼 2 条
      const whales = [
        new Whale({ width: w, height: h }, { size: 55, color: pal.whale, alpha: pal.whaleAlpha }),
        new Whale({ width: w, height: h }, { size: 40, color: pal.whale, alpha: pal.whaleAlpha }),
      ]
      stateRef.current = { schools: schools.flat(), whales, w, h, schoolsGrouped: schools }
    }

    const draw = () => {
      if (!stateRef.current) return
      const { schools, whales, w, h } = stateRef.current
      const pal = palette()

      ctx.clearRect(0, 0, w, h)

      // 鱼按 Boids 更新
      for (const f of schools) f.flock(schools)
      for (const f of schools) f.update({ width: w, height: h }, 0)
      for (const wh of whales) wh.update({ width: w, height: h }, 0)

      // 按深度排序绘制（远的先画）
      const all = [...schools, ...whales].sort((a, b) => a.y - b.y)
      for (const obj of all) obj.draw(ctx, isLight)

      raf = requestAnimationFrame(draw)
    }

    setup()
    draw()

    const onResize = () => setup()
    window.addEventListener('resize', onResize)

    const themeObs = new MutationObserver(() => {
      isLight = document.documentElement.classList.contains('theme-light')
      const pal = palette()
      // 重新染色
      if (stateRef.current) {
        stateRef.current.schools.forEach((f, i) => {
          f.color = pal.fish[i % pal.fish.length]
          f.alpha = pal.fishAlpha
        })
        stateRef.current.whales.forEach((w) => {
          w.color = pal.whale
          w.alpha = pal.whaleAlpha
        })
      }
    })
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      themeObs.disconnect()
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* 1. 海洋深度渐变 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, var(--ocean-grad-top) 0%, var(--ocean-grad-mid) 40%, var(--ocean-grad-bottom) 100%)',
        }}
      />

      {/* 2. 焦散光纹 */}
      <Caustics />

      {/* 3. Canvas 鱼群层（随滚动上移） */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <canvas ref={canvasRef} className="h-screen w-screen" />
      </motion.div>

      {/* 4. 顶部水面光斑 */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: '30vh',
          background: 'linear-gradient(180deg, var(--ray-color) 0%, transparent 100%)',
        }}
      />

      {/* 5. 暗角 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, var(--vignette-top) 0%, transparent 25%, transparent 75%, var(--vignette-bottom) 100%)',
        }}
      />
    </div>
  )
}

/* 焦散光纹 */
function Caustics() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 'var(--caustic-opacity, 0.4)' }}>
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
            <svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
              <filter id='c'>
                <feTurbulence type='fractalNoise' baseFrequency='0.012 0.025' numOctaves='2' seed='3'/>
                <feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.5 -0.3'/>
              </filter>
              <rect width='100%' height='100%' filter='url(#c)'/>
            </svg>
          `)}")`,
          backgroundSize: '600px 600px',
          mixBlendMode: 'screen',
        }}
        animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
            <svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
              <filter id='c2'>
                <feTurbulence type='fractalNoise' baseFrequency='0.018 0.03' numOctaves='2' seed='7'/>
                <feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.5 -0.4'/>
              </filter>
              <rect width='100%' height='100%' filter='url(#c2)'/>
            </svg>
          `)}")`,
          backgroundSize: '500px 500px',
          mixBlendMode: 'screen',
        }}
        animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
