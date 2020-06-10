import * as React from 'react'
import { CornerMenu } from './corner-menu'
import { TodaysPick } from './todays-pick'
import { OnlineRoomList } from './onlive-room-list'

export function Home() {
  return (
    <>
      <TodaysPick />
      <OnlineRoomList />
      <CornerMenu />
    </>
  )
}
