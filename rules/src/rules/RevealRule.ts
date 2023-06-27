import { Faction } from '../Faction'
import { MaterialType } from '../material/MaterialType'
import { LocationType } from '../material/LocationType'
import { ItemMove, ItemMoveType, MaterialMove, MaterialRulesPart, MoveKind } from '@gamepark/rules-api'
import { RuleId } from './RuleId'
import { FactionCards } from '../material/FactionCardType'
import { FactionCardKind } from './cards/FactionCardRule'

export class RevealRule extends MaterialRulesPart<Faction, MaterialType, LocationType> {

  getAutomaticMoves(): MaterialMove<Faction, MaterialType, LocationType>[] {
    const revealCards = this.material(MaterialType.FactionCard)
      .location((location) => location.type === LocationType.Battlefield || location.type === LocationType.AstralPlane)
      .filter((item) => !!item.rotation?.y)
      .moveItems({ rotation: {} })

    return [
      ...revealCards,
      // TODO: create utils to get the next player
      this.rules().startPlayerTurn(RuleId.InitiativeActivationRule, this.game.players[0])
    ]
  }

  afterItemMove(move: ItemMove<Faction, MaterialType, LocationType>): MaterialMove<Faction, MaterialType, LocationType>[] {
    if (move.kind === MoveKind.ItemMove && move.type === ItemMoveType.Move) {
      const revealedCard = this.material(move.itemType).getItems()[move.itemIndex]
      if (FactionCards[revealedCard.id.front].kind !== FactionCardKind.Spell) {
        return [
          this.material(MaterialType.FactionToken)
            .player(revealedCard.location.player)
            .createItem({
              id: revealedCard.location.player,
              location: { parent: revealedCard.id, type: LocationType.FactionCard, player: revealedCard.location.player }
            })
        ]
      }
    }

    return []
  }
}
