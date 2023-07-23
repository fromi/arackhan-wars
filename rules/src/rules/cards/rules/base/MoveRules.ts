import { Material, MaterialGame, MaterialMove, MoveItem, PlayerTurnRule } from '@gamepark/rules-api'
import { isMovementAttribute } from '../attribute/MovementAttribute'
import { FactionCardEffectHelper } from '../helper/FactionCardEffectHelper'
import { getFactionCardDescription } from '../../../../material/FactionCard'
import { isSpell } from '../../descriptions/base/Spell'
import { MaterialType } from '../../../../material/MaterialType'
import { ActivatedCard, ActivationRuleMemory } from '../../../types'
import { onBattlefieldAndAstralPlane } from '../../../../utils/LocationUtils'
import { LocationType } from '../../../../material/LocationType'
import equal from 'fast-deep-equal'
import { getAdjacentCards } from '../../../../utils/move.utils'
import { RuleId } from '../../../RuleId'
import { CardAttributeType } from '../../descriptions/base/FactionCardDetail'

export class MoveRules extends PlayerTurnRule {
  private readonly effectHelper: FactionCardEffectHelper

  constructor(game: MaterialGame,
              effectHelper?: FactionCardEffectHelper) {
    super(game)
    this.effectHelper = effectHelper ?? new FactionCardEffectHelper(game)
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
    const card = cardMaterial.getItem()!
    const cardDescription = getFactionCardDescription(card.id.front)

    return cardDescription
      .getAttributes()
      .filter(isMovementAttribute)
      .flatMap((attribute) => attribute.getAttributeRule(this.game).getLegalMovements(cardMaterial, this.effectHelper))
  }

  canMove = (cardIndex: number) => {
    const card = this.material(MaterialType.FactionCard).index(cardIndex)
    if (!this.isActive(card)) return false


    const { activatedCards = [] } = this.getMemory<ActivationRuleMemory>(this.player)

    // 1. must not be in the memory
    return !activatedCards.find((card) => card.card === cardIndex)
  }

  isActive(cardMaterial: Material): boolean {

    // Spell is always considered non activable
    const card = cardMaterial.getItem()!
    const cardDescription = getFactionCardDescription(card.id.front)

    const isInitiativeRule = this.game.rule!.id === RuleId.InitiativeActivationRule
    if (isInitiativeRule && (!cardDescription.hasInitiative() || this.effectHelper.hasLostAttributes(cardMaterial.getIndex(), CardAttributeType.Initiative))) return false
    if (isSpell(cardDescription)) return false

    // Other cards are activable if there is a non returned token on it
    return !!this
      .material(MaterialType.FactionToken)
      .parent(cardMaterial.getIndex())
      .rotation((rotation) => !rotation?.y)
      .length
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
    const battlefieldCards = this.material(MaterialType.FactionCard).location(LocationType.Battlefield)
    // TODO: in case of a > 2 player game with same faction, it is possible to have 2 "The fear" around the card (in this cas, it must remains deactivated
    moves.push(...getAdjacentCards(card, battlefieldCards).flatMap((targetIndex) => this.effectHelper.onCasterMoveAway(move.itemIndex, targetIndex)))

    return moves
  }

  afterItemMove(move: MoveItem): MaterialMove[] {
    this.memorizeCardPlayed({ card: move.itemIndex })

    const card = this.material(MaterialType.FactionCard).index(move.itemIndex)
    const battlefieldCards = this.material(MaterialType.FactionCard).location(LocationType.Battlefield)
    return getAdjacentCards(card, battlefieldCards).flatMap((targetIndex) => this.effectHelper.onCasterMoveTo(move.itemIndex, targetIndex))
  }

  memorizeCardPlayed(activation: ActivatedCard) {
    const { activatedCards = [] } = this.getMemory<ActivationRuleMemory>(this.player)
    const activatedCard = activatedCards.find((activatedCard) => activatedCard.card === activation.card)
    if (!activatedCard) {
      this.memorize<ActivationRuleMemory>({
        activatedCards: [...activatedCards, activation]
      }, this.player)

    } else {
      const updatedActivation = { ...activatedCards, ...activation }
      this.memorize<ActivationRuleMemory>({
        activatedCards: [...activatedCards.filter((card) => card !== activatedCard), updatedActivation]
      }, this.player)
    }
  }
}
