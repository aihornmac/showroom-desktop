import * as React from 'react'
import { format } from 'date-fns'
import styled from 'styled-components'
import { ipc } from '../ipc/client'
import { useBoxedValue } from '../utils/react-hooks'

export const RoomCard = React.memo((props: {
  data: {
    readonly id: number
    readonly name: string
    readonly image: string
    // in second
    readonly startTime: number
    readonly viewNum?: number
  }
}) => {
  const { id, name, image, startTime, viewNum } = props.data

  const timeText = format(startTime * 1000, `M/d HH:ss`) + '〜'

  const roomIdRef = useBoxedValue(id)

  const onEnter = React.useMemo(() => () => {
    console.log(roomIdRef.current)
    ipc.async('openRoom')(roomIdRef.current)
  }, [])

  return (
    <Card>
      <Image onClick={onEnter} style={{ backgroundImage: `url(${JSON.stringify(image)})` }}>
        {viewNum ?? (
          <Views>{viewNum}</Views>
        )}
      </Image>
      <Info>
        <Title>
          <TitleCropper>
            {name}
          </TitleCropper>
        </Title>
        <Time>{timeText}</Time>
      </Info>
    </Card>
  )
})

RoomCard.displayName = 'RoomCard'

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
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: 10px;
`

const Title = styled.div`
  flex: 1 1 0;
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

const TitleCropper = styled.div`
  flex: 0 1 auto;
  height: 2.4em;
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
  cursor: pointer;
`

const Views = styled.div`
  position: absolute;
  left: 5px;
  bottom: 5px;
  background-color: red;
`
