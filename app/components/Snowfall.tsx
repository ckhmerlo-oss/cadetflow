'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from './ThemeProvider'

export default function Snowfall() {
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)

  // Wait for mount to access window/theme safely
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !canvasRef.current) return
    
    // Only run on christmas themes
    if (theme !== 'christmas' && theme !== 'christmas-dark') return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let snowflakes: Array<{x: number, y: number, radius: number, speed: number, wind: number}> = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createSnowflakes = () => {
      const count = 100 // Number of snowflakes
      snowflakes = []
      for (let i = 0; i < count; i++) {
        snowflakes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1,
          speed: Math.random() * 1 + 0.5,
          wind: Math.random() * 0.5 - 0.25
        })
      }
    }

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // White snow for dark themes, Icy Blue/Slate for light themes (so it shows up on white bg)
      if (theme === 'christmas') {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.6)' // Slate-400 with opacity
      } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)' 
      }

      ctx.beginPath()
      snowflakes.forEach(flake => {
        ctx.moveTo(flake.x, flake.y)
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
        
        flake.y += flake.speed
        flake.x += flake.wind

        // Reset if it goes off screen
        if (flake.y > canvas.height) {
          flake.y = -flake.radius
          flake.x = Math.random() * canvas.width
        }
        if (flake.x > canvas.width) flake.x = 0
        if (flake.x < 0) flake.x = canvas.width
      })
      ctx.fill()
      
      animationFrameId = requestAnimationFrame(update)
    }

    // Initialize
    resize()
    createSnowflakes()
    update()
    
    window.addEventListener('resize', () => {
        resize()
        createSnowflakes()
    })

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      // Clear canvas on cleanup
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [theme, mounted])

  // Don't render anything if not mounted or not christmas
  if (!mounted) return null
  if (theme !== 'christmas' && theme !== 'christmas-dark') return null

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  )
}