/** @jsxImportSource @emotion/react */
import { RuleId } from '@gamepark/arackhan-wars/rules/RuleId'
import { FailuresDialog, FullscreenDialog, LoadingScreen, MaterialHeader, MaterialImageLoader, Menu, useGame } from '@gamepark/react-game'
import { MaterialGame } from '@gamepark/rules-api'
import { useEffect, useState } from 'react'
import DeckbuildingGameDisplay from './DeckbuildingGameDisplay'
import { DeckbuildingHeader } from './DeckbuildingHeader'

export default function DeckbuildingApp() {
  const game = useGame<MaterialGame>()
  const [isJustDisplayed, setJustDisplayed] = useState(true)
  const [isImagesLoading, setImagesLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => setJustDisplayed(false), 2000)
  }, [])
  const loading = !game || isJustDisplayed || isImagesLoading
  return (
    <>
      <DeckbuildingGameDisplay/>
      <LoadingScreen display={loading} author={['Robert Palmer', 'Mickaël Bour']} artist="Robert Palmer" publisher="Nothing But Games" developer="Game Park"/>
      <MaterialHeader rulesStepsHeaders={{[RuleId.Deckbuilding]: DeckbuildingHeader}} loading={loading}/>
      <MaterialImageLoader onImagesLoad={() => setImagesLoading(false)}/>
      <Menu/>
      <FailuresDialog/>
      <FullscreenDialog/>
    </>
  )
}
