import React from 'react'

import './style.css'
type ILoadingProps = {
  type?: 'area' | 'app'
}
const Loading = (
  { type = 'area' }: ILoadingProps = { type: 'area' },
) => {
  return (
    <div className={`flex w-full justify-center items-center ${type === 'app' ? 'h-full' : ''}`}>
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-opacity-25"></div>
    </div>
  )
}
export default Loading
