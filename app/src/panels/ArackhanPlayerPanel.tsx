/** @jsxImportSource @emotion/react */
import { FC, useMemo } from 'react'
import { PlayerId } from '@gamepark/arackhan-wars/ArackhanWarsOptions'
import { Avatar, backgroundCss, PlayerTimer, SpeechBubbleDirection, usePlayerName, useRules } from '@gamepark/react-game'
import { css } from '@emotion/react'
import { ArackhanWarsRules } from '@gamepark/arackhan-wars/ArackhanWarsRules'
import { Faction } from '@gamepark/arackhan-wars/material/Faction'
import whitelandsPanel from '../images/panels/whitelands-panel.png'
import nakkaPanel from '../images/panels/nakka-panel.png'
import greyOrderPanel from '../images/panels/grey-order-panel.png'
import blightPanel from '../images/panels/blight-panel.png'
import timerBackground from '../images/panels/timer.png'
import { MaterialType } from '@gamepark/arackhan-wars/material/MaterialType'
import { LocationType } from '@gamepark/arackhan-wars/material/LocationType'

type PlayerPanelProps = {
  player: PlayerId
  bottom: boolean
}

export const ArackhanPlayerPanel: FC<PlayerPanelProps> = ({ player, bottom }) => {
  const playerName = usePlayerName(player)
  const rules = useRules<ArackhanWarsRules>()!
  const faction = useMemo(() =>
      rules.material(MaterialType.FactionCard).location(LocationType.Hand).player(player).getItem()!.id.back as Faction
    , [rules, player])
  const score = useMemo(() => rules?.getScore(player), [rules, player])
  return (
    <div css={[panelCss, bottom ? bottomPosition : topPosition, backgroundCss(backgroundImage[faction])]}>
      <Avatar css={avatarStyle} playerId={player}
              speechBubbleProps={{ direction: bottom ? SpeechBubbleDirection.TOP_LEFT : SpeechBubbleDirection.BOTTOM_LEFT }}/>
      <span css={nameStyle}>{playerName}</span>
      {score !== undefined && <span css={[scoreStyle, score > 100 && css`font-size: 3em;`]}>{rules?.getScore(player)}</span>}
      {!rules?.isOver() && <div css={timerCss}><PlayerTimer playerId={player} css={timerText}/></div>}
    </div>
  )
}

const panelWidth = 50
const timerWidth = 19.2

const panelCss = css`
  position: absolute;
  right: 1em;
  width: ${panelWidth}em;
  height: ${panelWidth / 3.95}em;
  font-family: "Cinzel", sans-serif;
`

const topPosition = css`
  top: 8.5em;
`

const bottomPosition = css`
  top: 82em;
`

const backgroundImage: Record<Faction, string> = {
  [Faction.Whitelands]: whitelandsPanel,
  [Faction.Nakka]: nakkaPanel,
  [Faction.GreyOrder]: greyOrderPanel,
  [Faction.Blight]: blightPanel
}

const avatarStyle = css`
  position: absolute;
  top: 46.5%;
  left: 13.15%;
  border-radius: 100%;
  height: 8.3em;
  width: 8.3em;
  color: black;
  transform: translate(-50%, -50%);
`

const nameStyle = css`
  position: absolute;
  color: rgba(238, 238, 238, 0.9);
  top: 51.8%;
  left: 52%;
  font-size: 2.8em;
  width: 50%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transform: translate(-50%, -50%);
`

const scoreStyle = css`
  position: absolute;
  color: #DFC7A1;
  top: 53%;
  right: 8.3%;
  transform: translate(50%, -50%);
  font-size: 4em;
`

const timerCss = css`
  position: absolute;
  background-image: url("${timerBackground}");
  background-size: cover;
  width: ${timerWidth}em;
  height: ${timerWidth * 73 / 283}em;
  top: 78%;
  left: 48.7%;
`

const timerText = css`
  position: absolute;
  font-size: 2.8em;
  top: 56%;
  left: 60%;
  transform: translate(-50%, -50%);
`
