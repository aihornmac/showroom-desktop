import * as React from 'react'
import { add } from 'date-fns'
import styled from 'styled-components'
import { ipc } from '../ipc/client'
import { niceToHave } from '../utils/flow-control'
import type { GetTimeTables } from '../modules/showroom-api'
import { i18n, LocaleContext } from './i18n'
import { getDayStartTimstamp } from '../utils/time'
import { RoomCard } from './room-card'

export const TodaysPick = React.memo(() => {
  const [data, setData] = React.useState(() => getListData())
  console.log(data)

  const locale = React.useContext(LocaleContext)

  React.useEffect(() => {
    niceToHave(async () => {
      const data = await ipc.async('getTimeTables')()
      setData(getListData(data?.time_tables))
    })
    return () => {}
  }, [])

  return (
    <Section>
      <Header>
        <HeaderTitle>{TodaysPickText.get(locale)}</HeaderTitle>
      </Header>
      <ListWrapper>
        <List>
          {!data ? 'loading...' : data.list.map((item, i) =>
            <RoomCard key={i} data={item} />
          )}
        </List>
      </ListWrapper>
    </Section>
  )
})

TodaysPick.displayName = 'TodaysPick'

function getListData(list?: GetTimeTables.Response['time_tables']) {
  if (!list) return
  const filteredList = getFilteredList(list)
  return {
    full: list,
    list: filteredList.map(x => {
      return {
        id: x.room_id,
        name: x.main_name,
        image: x.image,
        startTime: x.started_at,
      }
    }),
  }
}

function getFilteredList(list: GetTimeTables.Response['time_tables']) {
  const now = Date.now()
  const todayTime = getDayStartTimstamp(now)
  const startTime = todayTime
  const endTime = +add(todayTime, { days: 2 })
  const startTimeInSecond = Math.floor(startTime / 1000)
  const endTimeInSecond = Math.floor(endTime / 1000)
  return list.filter(item => {
    const time = item.started_at
    if (!(time >= startTimeInSecond && time < endTimeInSecond)) return false
    return true
  })
}

const Section = styled.div`
  position: relative;
  width: 100%;
  background-color: #607D8B;
  box-sizing: border-box;
  overflow: hidden;
`

const Header = styled.div`
  padding: 1px 20px;
  background: #4EC0E3;
`

const HeaderTitle = styled.h2`
  color: #fff;
`

const ListWrapper = styled.div`
  position: relative;
  width: 100%;
  padding: 30px 20px 10px;
  background-color: #607D8B;
  box-sizing: border-box;
  overflow: hidden;
`

const List = styled.div`
  display: flex;
  padding-bottom: 20px;
  overflow-x: auto;
  overflow-y: hidden;
`

const TodaysPickText = i18n({
  en: () => `Today's Pick`,
  zh: () => `今日优选`,
  ja: () => `今日のおすすめ`,
})
