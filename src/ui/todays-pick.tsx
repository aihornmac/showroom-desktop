import * as React from 'react'
import { format, add } from 'date-fns'
import styled from 'styled-components'
import { ipc } from '../ipc/client'
import { niceToHave } from '../utils/flow-control'
import type { GetTimeTables } from '../showroom/api'
import { i18n, LocaleContext } from './i18n'
import { getDayStartTimstamp } from '../utils/time'

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
            <CardComponent key={i} data={item} />
          )}
        </List>
      </ListWrapper>
    </Section>
  )
})

TodaysPick.displayName = 'TodaysPick'

const CardComponent = React.memo((props: {
  data: GetTimeTables.Response.TimeTable,
}) => {
  const { data } = props

  const timeText = format(data.started_at * 1000, `M/d HH:ss`) + '〜'

  return (
    <Card>
      <Image style={{ backgroundImage: `url(${JSON.stringify(data.image)})` }}>
        {!data.view_num ? null : (
          <Views>{data.view_num}</Views>
        )}
      </Image>
      <Info>
        <Title>{data.main_name}</Title>
        <Time>{timeText}</Time>
      </Info>
    </Card>
  )
})

CardComponent.displayName = 'Card'

function getListData(list?: GetTimeTables.Response['time_tables']) {
  if (!list) return
  return {
    full: list,
    list: getFilteredList(list),
  }
}

function getFilteredList(list: GetTimeTables.Response['time_tables']) {
  const now = Date.now()
  const startTime = getDayStartTimstamp(now)
  const endTime = Math.max(
    +add(startTime, { days: 1 }),
    +add(now, { hours: 12 }),
  )
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

const Card = styled.div`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  margin: 0 10px;
  width: 224px;
  height: 210px;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,.4);
`

const Info = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  padding: 10px;
`

const Title = styled.div`
  flex: 1 1 auto;
  color: #414141;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`

const Time = styled.div`
  flex: 0 0 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #9A9A9A;
  font-size: 14px;
  line-height: 1.2;
  height: 16px;
`

const Image = styled.div`
  position: relative;
  flex: 0 0 auto;
  width: 224px;
  height: 126px;
  background: transparent no-repeat center center;
  background-size: cover;
`

const Views = styled.div`
  position: absolute;
  left: 5px;
  bottom: 5px;
  background-color: red;
`

const TodaysPickText = i18n({
  en: () => `Today's Pick`,
  zh: () => `今日优选`,
  ja: () => `今日のおすすめ`,
})
