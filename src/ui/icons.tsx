import * as React from 'react'

export const IconWinMaximize = React.memo(() =>
  <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
    <rect x="1.5" y="3.5" width="7" height="7" stroke="currentColor" strokeWidth="1" fillOpacity="0" />
    <polyline points="3.5,3.5 3.5,1.5 10.5,1.5 10.5,8.5 8.5,8.5" stroke="currentColor" strokeWidth="1" fillOpacity="0" />
  </svg>,
  () => true,
)

IconWinMaximize.displayName = 'IconWinMaximize'

export const IconWinMinimize = React.memo(() =>
  <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
    <line x1="1" y1="5.5" x2="11" y2="5.5" stroke="currentColor" strokeWidth="1" />
  </svg>,
  () => true,
)

IconWinMinimize.displayName = 'IconWinMinimize'

export const IconWinClose = React.memo(() =>
  <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
    <path d="M1,1 l 10,10 M1,11 l 10,-10" stroke="currentColor" strokeWidth="1" />
  </svg>,
  () => true,
)

IconWinClose.displayName = 'IconWinClose'
