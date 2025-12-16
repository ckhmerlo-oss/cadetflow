'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from './ThemeProvider'

export default function Snowfall() {
  const { theme, snowEnabled } = useTheme() // <--- Get snowEnabled
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !canvasRef.current) return
    
    // Only run if theme is christmas-y AND snow is enabled
    const isChristmas = theme === 'christmas' || theme === 'christmas-dark'
    if (!isChristmas || !snowEnabled) {
        // Ensure canvas is clear if we toggle off while staying on the page
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        return
    }

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
      const count = 100 
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
      
      if (theme === 'christmas') {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.6)' 
      } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)' 
      }

      ctx.beginPath()
      snowflakes.forEach(flake => {
        ctx.moveTo(flake.x, flake.y)
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
        
        flake.y += flake.speed
        flake.x += flake.wind

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
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [theme, mounted, snowEnabled]) // <--- Dependency added

  if (!mounted) return null
  
  // Don't render anything if conditions aren't met
  const isChristmas = theme === 'christmas' || theme === 'christmas-dark'
  if (!isChristmas || !snowEnabled) return null

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  )
}