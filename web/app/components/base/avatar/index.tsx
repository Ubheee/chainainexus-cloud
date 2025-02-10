'use client'
import { useState } from 'react'
import Image from 'next/image'
import cn from '@/utils/classnames'

export type AvatarProps = {
  name: string
  avatar: string | null
  size?: number
  className?: string
  textClassName?: string
}

export function getGradientColors(address: string) {
  const seedArr = address.match(/.{1,7}/g)?.splice(0, 5)
  const colors: string[] = []

  seedArr?.forEach((seed) => {
    let hash = 0
    for (let i = 0; i < seed.length; i += 1) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash)
      hash = hash & hash
    }

    const rgb = [0, 0, 0]
    for (let i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 255
      rgb[i] = value
    }
    colors.push(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`)
  })

  return colors
}

const Avatar = ({
  name,
  avatar,
  size = 30,
  className,
  textClassName,
}: AvatarProps) => {
  const avatarClassName = 'shrink-0 flex items-center rounded-full bg-components-button-primary-bg'
  const style = { width: `${size}px`, height: `${size}px`, fontSize: `${size}px`, lineHeight: `${size}px` }
  const [imgError, setImgError] = useState(false)

  const handleError = () => {
    setImgError(true)
  }

  if (avatar && !imgError) {
    return (
      <Image
        className={cn(avatarClassName, className)}
        style={style}
        alt={name}
        src={avatar}
        width={size}
        height={size}
        onError={handleError}
      />
    )
  }

  // Generate gradient colors based on name when no avatar
  const colors = getGradientColors(name)
  const gradientStyle = {
    ...style,
    backgroundColor: colors[0],
    backgroundImage: `
        radial-gradient(at 66% 77%, ${colors[1]} 0px, transparent 50%),
        radial-gradient(at 29% 97%, ${colors[2]} 0px, transparent 50%),
        radial-gradient(at 99% 86%, ${colors[3]} 0px, transparent 50%),
        radial-gradient(at 29% 88%, ${colors[4]} 0px, transparent 50%)
      `,
  }

  return (
    <div
      className={cn(avatarClassName, className)}
      style={gradientStyle}
    >
    </div>
  )
}

export default Avatar
