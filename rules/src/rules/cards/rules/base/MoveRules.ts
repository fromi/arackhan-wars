import { MaterialGame, MaterialMove, MoveItem, PlayerTurnRule } from '@gamepark/rules-api'
import { isMovementAttribute } from '../attribute/MovementAttribute'
import { FactionCardInspector } from '../helper/FactionCardInspector'
import { MaterialType } from '../../../../material/MaterialType'
import { ActivatedCard } from '../../../types'
import { onBattlefieldAndAstralPlane } from '../../../../utils/LocationUtils'
import { LocationType } from '../../../../material/LocationType'
import equal from 'fast-deep-equal'
import { RuleId } from '../../../RuleId'
import { CardAttributeType } from '../../descriptions/base/FactionCardCharacteristics'
import { PlayerId } from '../../../../ArackhanWarsOptions'
import { Memory } from '../../../Memory'
import { getCardRule } from './CardRule'

export class MoveRules extends PlayerTurnRule<PlayerId, MaterialType, LocationType> {
  private readonly cardInspector: FactionCardInspector

  constructor(game: MaterialGame,
              cardInspector?: FactionCardInspector) {
    super(game)
    this.cardInspector = cardInspector ?? new FactionCardInspector(game)
  }

  getPlayerMoves(): MaterialMove<number, number, number>[] {
    const battlefieldCards = this
      .material(MaterialType.FactionCard)
      .location(onBattlefieldAndAstralPlane)

    const attackers = battlefieldCards.player(this.player)
    const moves: MaterialMove[] = []
    for (const attacker of attackers.getIndexes()) {
      moves.push(...this.getMoves(attacker))
    }

    return moves
  }


  getMoves(cardIndex: number): MaterialMove[] {
    if (!this.canMove(cardIndex)) return []
    const cardMaterial = this.material(MaterialType.FactionCard).index(cardIndex)
    const cardDescription = getCardRule(this.game, cardIndex).characteristics

    return cardDescription
      .getAttributes()
      .filter(isMovementAttribute)
      .flatMap((attribute) => attribute.getAttributeRule(this.game).getLegalMovements(cardMaterial, this.cardInspector))
  }

  canMove = (cardIndex: number) => {
    if (!this.isActive(cardIndex)) return false

    const activatedCards = this.remind<ActivatedCard[]>(Memory.ActivatedCards)

    // 1. must not be in the memory
    return !activatedCards.find((card) => card.card === cardIndex)
  }

  isActive(cardIndex: number): boolean {
    const cardRule = getCardRule(this.game, cardIndex)
    const characteristics = cardRule.characteristics
    const isInitiativeRule = this.game.rule!.id === RuleId.InitiativeActivationRule
    if (isInitiativeRule && (!characteristics.hasInitiative() || this.cardInspector.hasLostAttributes(cardIndex, CardAttributeType.Initiative))) return false
    return cardRule.isActive
  }

  beforeItemMove(move: MoveItem): MaterialMove[] {
    const moves: MaterialMove[] = []
    if (move.position.location?.type === LocationType.Battlefield) {
      const cardOnDestination = this
        .material(MaterialType.FactionCard)
        .location((location) => (
          location.type == LocationType.Battlefield
          && location.x === move.position.location?.x
          && location.y === move.position.location?.y
        ))

      if (cardOnDestination.length) {
        const sourceCard = this
          .material(MaterialType.FactionCard)
          .getItem(move.itemIndex)!

        this.memorizeCardPlayed({ card: cardOnDestination.getIndex() })

        moves.push(...cardOnDestination.moveItems({ location: { ...sourceCard.location } }))
      }
    }

    const card = this.material(MaterialType.FactionCard).index(move.itemIndex)
    if (equal(move.position.location, card.getItem()!.location)) return []
    return moves
  }

  afterItemMove(move: MoveItem): MaterialMove[] {
    this.memorizeCardPlayed({ card: move.itemIndex })
    return []
  }

  memorizeCardPlayed(activation: ActivatedCard) {
    const activatedCards = this.remind<ActivatedCard[]>(Memory.ActivatedCards)
    const activatedCard = activatedCards.find((activatedCard) => activatedCard.card === activation.card)
    if (!activatedCard) {
      this.memorize<ActivatedCard[]>(Memory.ActivatedCards, activatedCards => [...activatedCards, activation])
    } else {
      const updatedActivation = { ...activatedCards, ...activation }
      this.memorize<ActivatedCard[]>(Memory.ActivatedCards, activatedCards => [...activatedCards.filter((card) => card !== activatedCard), updatedActivation])
    }
  }
}
