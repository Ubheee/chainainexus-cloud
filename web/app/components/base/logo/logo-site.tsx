'use client'
import type { FC } from 'react'
import classNames from '@/utils/classnames'
import { useSelector } from '@/context/app-context'

type LogoSiteProps = {
  className?: string
}

const LogoSite: FC<LogoSiteProps> = ({
  className,
}) => {
  const { theme } = useSelector((s) => {
    return {
      theme: s.theme,
    }
  })

  const src = theme === 'light' ? '/logo/logo-site.svg' : `/logo/logo-site-${theme}.svg`
  return (
    <img
      src={src}
      className={classNames('block w-auto h-8', className)}
      alt='logo'
    />
  )
}

export default LogoSite
