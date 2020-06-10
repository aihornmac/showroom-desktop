import * as React from 'react'
import styled from 'styled-components'
import { ipc } from '../ipc/client'
import { niceToHave } from '../utils/flow-control'
import type { GetLiveOnlines } from '../modules/showroom-api'
import { RoomCard } from './room-card'
import { predicate } from '../utils/js'

export const OnlineRoomList = React.memo(() => {
  const [data, setData] = React.useState(() => getListData())
  console.log(data)

  React.useEffect(() => {
    niceToHave(async () => {
      const data = await ipc.async('getLiveOnlines')()
      setData(getListData(data))
    })
    return () => {}
  }, [])

  return (
    <>
      {!data ? 'loading...' : data.genreList.map(genre =>
        <Section key={genre.genre_id}>
          <Header>
            <HeaderTitle>{genre.genre_name}</HeaderTitle>
          </Header>
          <ListWrapper>
            <List>
              {genre.rooms.map((live, i) =>
                <RoomCard key={i} data={live} />
              )}
            </List>
          </ListWrapper>
        </Section>
      )}
    </>
  )
})

OnlineRoomList.displayName = 'OnlineRoomList'

function getListData(list?: GetLiveOnlines.Response) {
  if (!list) return
  return {
    original: list,
    genreList: list.onlives.map(genre => {
      return {
        ...genre,
        rooms: genre.lives.map(live => {
          if (live.cell_type !== 100 && live.cell_type !== 102) return
          return {
            id: live.room_id,
            name: live.main_name,
            image: live.image,
            startTime: live.started_at,
          }
        }).filter(predicate)
      }
    }),
  }
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
