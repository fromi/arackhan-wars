/** @jsxImportSource @emotion/react */
import board from '../images/boards/core-box-battle-mat.jpg'
import { BoardDescription, MaterialContext } from '@gamepark/react-game'
import { LocationType } from '@gamepark/arackhan-wars/material/LocationType'
import { PlayMatRules } from './PlayMatRules'
import { battlefieldCoordinates } from '@gamepark/arackhan-wars/material/Board'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { PlayerId } from '@gamepark/arackhan-wars/ArackhanWarsOptions'

export const boardRatio = 576 / 576

export class PlayMatDescription extends BoardDescription {
  height = 57.6
  ratio = boardRatio
  image = board

  staticItem = { location: { type: LocationType.Table } }

  getLocations(_item: MaterialItem, context: MaterialContext): Location[] {
    return [
      ...this.getBattlefieldSpaces(),
      ...this.getAstralPlanes(context),
      ...this.getDecks(context),
      ...this.getDiscards(context)
    ]
  }

  rules = PlayMatRules

  private getBattlefieldSpaces = () => {
    return battlefieldCoordinates.map((space) => ({
      type: LocationType.Battlefield,
      x: space.x,
      y: space.y
    }))
  }

  private getAstralPlanes = (context: MaterialContext) => {
    return context.game.players.flatMap((player: PlayerId) => {
      return [{
        type: LocationType.AstralPlane,
        x: 0,
        player: player
      }, {
        type: LocationType.AstralPlane,
        x: 1,
        player: player
      }]
    })
  }

  private getDecks(context: MaterialContext) {
    return [{
      type: LocationType.PlayerDeck,
      player: context.player
    }]
  }

  private getDiscards(context: MaterialContext) {
    return context.game.players.map((player: PlayerId) => ({
      type: LocationType.PlayerDiscard,
      id: player,
      player
    }))
  }
}

export const playMatDescription = new PlayMatDescription()

