/** @jsxImportSource @emotion/react */
import { BaseContext, ItemLocator, PlaceLocationContext } from '@gamepark/react-game'
import { MaterialType } from '@gamepark/arackhan-wars/material/MaterialType'
import { LocationType } from '@gamepark/arackhan-wars/material/LocationType'
import { Location, MaterialItem, XYCoordinates } from '../../../../workshop/packages/rules-api'
import { factionCardDescription } from '../material/FactionCardDescription'
import { css, Interpolation, Theme } from '@emotion/react'
import { PlayerId } from '@gamepark/arackhan-wars/ArackhanWarsOptions'

export class AstralPlaneLocator extends ItemLocator<PlayerId, MaterialType, LocationType> {
  parentItemType = MaterialType.PlayMat

  getLocations(context: PlaceLocationContext<PlayerId, MaterialType, LocationType>): Location<PlayerId, LocationType>[] {
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

  getPositionOnParent(location: Location<PlayerId, LocationType>, context: BaseContext<PlayerId, MaterialType, LocationType>): XYCoordinates {
    const height = factionCardDescription.height
    const width = height * factionCardDescription.ratio
    const index = this.getRelativePlayerIndex(context, location.player!)
    if (index === 0) {
      return { x: 68.3 + ((location.x!) * (width + 5.3)), y: 90 }
    }

    return { x: 31.55 - ((location.x!) * (width + 5.3)), y: 9.85 }

  }

  getLocationCss(_location: Location<PlayerId, LocationType>): Interpolation<Theme> {
    const height = factionCardDescription.height
    const width = height * factionCardDescription.ratio
    return css`
      width: ${width}em;
      height: ${height}em;
      border-radius: 0.2em;
    `
  }

  isDragOnlyLocation(_location: Location<PlayerId, LocationType>, _context: PlaceLocationContext<PlayerId, MaterialType, LocationType>): boolean {
    return true
  }

  isHidden(item: MaterialItem<PlayerId, LocationType>): boolean {
    return item.rotation?.y === 1
  }
}
