/** @jsxImportSource @emotion/react */
import { FailuresDialog, FullscreenDialog, LoadingScreen, MaterialHeader, MaterialImageLoader, Menu, useGame } from '@gamepark/react-game'
import { useEffect, useState } from 'react'
import GameDisplay from './GameDisplay'
import { MaterialGame } from '@gamepark/rules-api'
import { RuleId } from '@gamepark/arackhan-wars/rules/RuleId'
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace'
import { GameOverHeader } from './headers/GameOverHeader'
import { StartHeader } from './headers/StartHeader'
import { PlacementHeader } from './headers/PlacementHeader'

export default function App() {
  const game = useGame<MaterialGame>()
  const [isJustDisplayed, setJustDisplayed] = useState(true)
  const [isImagesLoading, setImagesLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => setJustDisplayed(false), 2000)
  }, [])
  const loading = !game || isJustDisplayed || isImagesLoading
  return (
    <>
      {!loading && <GameDisplay/>}
      <LoadingScreen display={loading} author="Someone" artist="Somebody" publisher="Nobody" developer="You"/>
      <MaterialHeader rulesStepsHeaders={RulesHeaders} GameOver={GameOverHeader}/>
      <MaterialImageLoader onImagesLoad={() => setImagesLoading(false)}/>
      <Menu/>
      <FailuresDialog/>
      <FullscreenDialog/>
    </>
  )
}

const RulesHeaders: Record<RuleId, () => ReactJSXElement> = {
  [RuleId.StartRule]: StartHeader,
  [RuleId.DrawRule]: () => <p></p>,
  [RuleId.PlacementRule]: PlacementHeader,
  [RuleId.RevealRule]: () => <p></p>,
  [RuleId.InitiativeActivationRule]: PlacementHeader,
  [RuleId.ActivationRule]: PlacementHeader,
  [RuleId.EndPhaseRule]: () => <p></p>,
  [RuleId.EndOfTheGameRule]: () => <p></p>
}
