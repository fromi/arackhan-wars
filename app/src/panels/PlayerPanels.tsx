/** @jsxImportSource @emotion/react */
import { FC } from 'react'
import { PlayerPanel, usePlayers } from '@gamepark/react-game'
import { css } from '@emotion/react'
import { PlayerColor } from '@gamepark/arackhan-wars/PlayerColor'

export const PlayerPanels: FC<any> = () => {
  const players = usePlayers({ sortFromMe: true })
  return (
    <>
      {players.map((player, index) =>
        <PlayerPanel key={player.id} playerId={player.id} color={playerColorCode[player.id]} css={panelPosition(index)}/>
      )}
    </>
  )
}
const panelPosition = (index: number) => css`
  position: absolute;
  right: 1em;
  top: ${8.5 + index * 16}em;
  width: 28em;
  height: 14em;
`

export const playerColorCode: Record<PlayerColor, string> = {
  [PlayerColor.Red]: 'red',
  [PlayerColor.Blue]: 'blue',
  [PlayerColor.Green]: 'green',
  [PlayerColor.Yellow]: 'yellow'
}