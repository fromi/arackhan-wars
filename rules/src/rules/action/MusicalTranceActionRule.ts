import { Material } from '@gamepark/rules-api'
import { Family } from '../../material/cards/Family'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { getCardRule } from '../CardRule'
import { Memory } from '../Memory'
import { MoveCardsActionRule } from './MoveCardsActionRule'

export class MusicalTranceActionRule extends MoveCardsActionRule {
  maxDistance = 2

  getCardsAllowedToMove(): Material {
    const movedCards = this.remind<number[]>(Memory.MovedCards)
    const battlefield = this.material(MaterialType.FactionCard).location(LocationType.Battlefield)
    return battlefield.player(this.player).filter((_, index) => {
        if (movedCards.includes(index)) return false
        const family = getCardRule(this.game, index).family
        return family === Family.Musician || family === Family.Dancer
      }
    )
  }
}
