import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'

type Particle = {
  x: number
  y: number
  radius: number
  dx: number
  dy: number
  alpha: number
  decay: number
  color: string
}

const MAX_PARTICLES = 500

let canvasCenterX = 0
let canvasCenterY = 0

const ClickParticles = forwardRef(({}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particles = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>(0)
  const handleClick = () => {
    spawnParticles()
  }

  useImperativeHandle(ref, () => ({
     handleClick
   }))

   const spawnParticles = () => {
     const count = 5
     for (let i = 0; i < count; i++) {
       particles.current.push({
         x: canvasCenterX,
         y: canvasCenterY,
         radius: Math.random() * 3 + 2,
         dx: (Math.random() - 0.5) * 20,
         dy: (Math.random() - 0.5) * 20,
         alpha: 1,
         decay: 0.01 + Math.random() * 0.01,
         color: `#5DB057`,
       })
     }

     // Ограничение общего числа частиц
     if (particles.current.length > MAX_PARTICLES) {
       particles.current.splice(0, particles.current.length - MAX_PARTICLES)
     }
     
   }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // Настройка для Retina-дисплеев
    const dpr = window.devicePixelRatio || 1
    canvas.width = 200 * dpr
    canvas.height = 200 * dpr
    canvas.style.width = '100%'
    canvasCenterX = canvas.width / 2 / dpr
    canvasCenterY = canvas.height / 2 / dpr
    ctx.scale(dpr, dpr)



    const render = () => {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)

      particles.current = particles.current.filter(p => p.alpha > 0)

      for (const p of particles.current) {
        p.x += p.dx
        p.y += p.dy
        p.alpha -= p.decay

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color.replace(/, *1\)$/, `, ${p.alpha})`)
        ctx.fill()
      }

      animationFrameRef.current = requestAnimationFrame(render)
    }

    render()
    return () => {
     cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
        width: '100%'
      }}
    />
  )
})

export default ClickParticles
