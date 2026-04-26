'use client'

import React from "react"

import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type AnimationType = 
  | 'fade-up' 
  | 'fade-down' 
  | 'fade-left' 
  | 'fade-right' 
  | 'zoom-in' 
  | 'zoom-out'
  | 'flip-up'
  | 'flip-down'

interface MotionDivProps {
  children: ReactNode
  animation?: AnimationType
  delay?: number
  duration?: number
  className?: string
  threshold?: number
}

const animationStyles: Record<AnimationType, { initial: string; animate: string }> = {
  'fade-up': {
    initial: 'opacity-0 translate-y-8',
    animate: 'opacity-100 translate-y-0',
  },
  'fade-down': {
    initial: 'opacity-0 -translate-y-8',
    animate: 'opacity-100 translate-y-0',
  },
  'fade-left': {
    initial: 'opacity-0 translate-x-8',
    animate: 'opacity-100 translate-x-0',
  },
  'fade-right': {
    initial: 'opacity-0 -translate-x-8',
    animate: 'opacity-100 translate-x-0',
  },
  'zoom-in': {
    initial: 'opacity-0 scale-95',
    animate: 'opacity-100 scale-100',
  },
  'zoom-out': {
    initial: 'opacity-0 scale-105',
    animate: 'opacity-100 scale-100',
  },
  'flip-up': {
    initial: 'opacity-0 rotateX-90',
    animate: 'opacity-100 rotateX-0',
  },
  'flip-down': {
    initial: 'opacity-0 -rotateX-90',
    animate: 'opacity-100 rotateX-0',
  },
}

export function MotionDiv({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  className,
  threshold = 0.1,
}: MotionDivProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold })
  const styles = animationStyles[animation]

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all',
        isVisible ? styles.animate : styles.initial,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  animation?: AnimationType
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 100,
  animation = 'fade-up',
}: StaggerContainerProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })
  const styles = animationStyles[animation]

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              className={cn(
                'transition-all duration-500',
                isVisible ? styles.animate : styles.initial
              )}
              style={{
                transitionDelay: `${index * staggerDelay}ms`,
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  )
}

interface CountUpProps {
  end: number
  suffix?: string
  prefix?: string
  className?: string
}

export function CountUp({ end, suffix = '', prefix = '', className }: CountUpProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.5 })
  
  return (
    <span ref={ref} className={className}>
      {prefix}
      <CountUpNumber end={end} isVisible={isVisible} />
      {suffix}
    </span>
  )
}

function CountUpNumber({ end, isVisible }: { end: number; isVisible: boolean }) {
  const { useCountUp } = require('@/hooks/use-scroll-animation')
  const count = useCountUp(end, 2000, isVisible)
  return <>{count}</>
}

// Floating animation component
export function FloatingElement({
  children,
  className,
  duration = 3000,
  distance = 10,
}: {
  children: ReactNode
  className?: string
  duration?: number
  distance?: number
}) {
  return (
    <div
      className={cn('animate-float', className)}
      style={{
        '--float-duration': `${duration}ms`,
        '--float-distance': `${distance}px`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

// Parallax component
export function ParallaxSection({
  children,
  className,
  speed = 0.5,
}: {
  children: ReactNode
  className?: string
  speed?: number
}) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div
        className="parallax-bg absolute inset-0"
        style={{ '--parallax-speed': speed } as React.CSSProperties}
      />
      {children}
    </div>
  )
}
