/** @jsxImportSource @emotion/react */
import { ItemContext, ItemLocator } from '@gamepark/react-game'
import { Coordinates, MaterialItem } from '@gamepark/rules-api'
import { MaterialType } from '@gamepark/arackhan-wars/material/MaterialType'
import { LocationType } from '@gamepark/arackhan-wars/material/LocationType'
import { PlayerId } from '@gamepark/arackhan-wars/ArackhanWarsOptions'

export class TableLocator extends ItemLocator<PlayerId, MaterialType, LocationType> {

  getPosition(item: MaterialItem<PlayerId, LocationType>, context: ItemContext): Coordinates {
    switch (context.type) {
      case MaterialType.PlayMat:
        return { x: 0, y: 0, z: 0 }
      case MaterialType.RoundTracker:
        return { x: 48, y: 0, z: 0 }
    }
    return super.getPosition(item, context)
  }
}
