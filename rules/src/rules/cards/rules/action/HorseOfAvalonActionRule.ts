import { isMoveItem, ItemMove, Location, MaterialMove } from '@gamepark/rules-api'
import { MaterialType } from '../../../../material/MaterialType'
import { LocationType } from '../../../../material/LocationType'
import { CardActionRule } from './CardActionRule'
import { isCreature } from '../../descriptions/base/Creature'
import { Memory } from '../../../Memory'
import { getCardRule } from '../base/CardRule'


export class HorseOfAvalonActionRule extends CardActionRule {

  getPlayerMoves() {
    const location = this.remind<Location>(Memory.Location)

    return this
      .material(MaterialType.FactionCard)
      .location(LocationType.Hand)
      .player(this.player)
      .filter((_, index) => isCreature(getCardRule(this.game, index).characteristics))
      .moveItems({ location })
  }

  afterItemMove(move: ItemMove<number, number, number>): MaterialMove<number, number, number>[] {
    if (!isMoveItem(move) || move.itemType !== MaterialType.FactionCard) return []
    return [
      this.material(MaterialType.FactionToken)
        .player(this.player)
        .createItem({
          // Must be the faction instead of the player
          id: this.remind(Memory.Token, this.player),
          location: { parent: move.itemIndex, type: LocationType.FactionTokenSpace, player: this.player }
        }),
      ...super.afterCardAction()
    ]
  }
}
