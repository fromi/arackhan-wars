import { MaterialType } from '../material/MaterialType'
import { LocationType } from '../material/LocationType'
import { CustomMove, isMoveItem, ItemMove, ItemMoveType, Material, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { PlayerId } from '../ArackhanWarsOptions'
import { CustomMoveType } from '../material/CustomMoveType'
import { getFactionCardDescription } from '../material/FactionCard'
import { RuleId } from './RuleId'
import { onBattlefieldAndAstralPlane } from '../utils/LocationUtils'
import { ActivatedCard, ActivationRuleMemory } from './types'
import { CardAttributeType, DiscardTiming } from './cards/descriptions/base/FactionCardDetail'
import { AttackRule } from './cards/rules/base/AttackRule'
import { MoveRules } from './cards/rules/base/MoveRules'
import { discardCard, discardCards } from '../utils/discard.utils'
import { isSpell } from './cards/descriptions/base/Spell'
import { activateTokens } from '../utils/activation.utils'
import { FactionCardEffectHelper } from './cards/rules/helper/FactionCardEffectHelper'


export class ActivationRule extends PlayerTurnRule<PlayerId, MaterialType, LocationType> {
  initiative = false

  getPlayerMoves(): MaterialMove[] {
    const battlefieldCards = this
      .material(MaterialType.FactionCard)
      .location(onBattlefieldAndAstralPlane)

    const effectHelper = new FactionCardEffectHelper(this.game)

    const playerCards = battlefieldCards.player(this.player)
    const opponentsCards = battlefieldCards.player((player) => player !== this.player)

    // Playable cards are those that can be place in this phase (initiative or not)
    // And with an active token on them
    const playableCards = playerCards.getIndexes()

    const moves: MaterialMove[] = []
    // Compute all attack and move moves
    for (const index of playableCards) {
      const cardMaterial = playerCards.index(index)
      const card = getFactionCardDescription(cardMaterial.getItem()!.id.front)
      if (!this.isActive(cardMaterial, effectHelper)) continue


      if (this.canAttack(index)) {
        moves.push(
          ...new AttackRule(this.game, cardMaterial, card, index, effectHelper).getLegalAttacks(opponentsCards)
        )
      }

      if (!this.canMoveOrUseAction(index)) continue

      moves.push(
        ...new MoveRules(this.game, cardMaterial, card, index, effectHelper).getLegalMovements()
      )

      /**if (rule.actionRule().length) {
        moves.push(this.rules().customMove(CustomMoveType.CardAction, { card: index }))
      }**/
    }

    moves.push(this.endTurnMove())
    return moves
  }

  isActive(cardMaterial: Material, _effectHelper: FactionCardEffectHelper): boolean {

    // Spell is always considered activable
    const card = cardMaterial.getItem()!
    const factionCard = getFactionCardDescription(card.id.front)
    if (isSpell(factionCard)) return true

    // Other cards are activable if there is a non returned token on it
    return !!this
      .material(MaterialType.FactionToken)
      .parent(cardMaterial.getIndex())
      .rotation((rotation) => !rotation?.y)
      .length
  }

  canAttack = (cardIndex: number) => {
    const { activatedCards = [] } = this.getPlayerMemory<ActivationRuleMemory>()

    // For cards that can attack, verify that it was not activated
    const activatedCardIndex = activatedCards.findIndex((card) => card.card === cardIndex)
    if (activatedCardIndex === -1) return true
    // If the card is not the last one in the array, can't attack
    if (activatedCardIndex !== (activatedCards.length - 1)) return false

    const activatedCard = activatedCards[activatedCardIndex]
    return activatedCard.targets === undefined && activatedCard.omnistrike === undefined
  }

  canMoveOrUseAction = (cardIndex: number) => {
    const { activatedCards = [] } = this.getPlayerMemory<ActivationRuleMemory>()

    // 1. must not be in the memory
    return !activatedCards.find((card) => card.card === cardIndex)
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

  endTurnMove = (): MaterialMove => {
    if (this.player == this.game.players[1]) {
      return this.rules().startPlayerTurn(RuleId.EndPhaseRule, this.nextPlayer)
    }

    return this.rules().startPlayerTurn(RuleId.ActivationRule, this.nextPlayer)
  }

  beforeItemMove(move: ItemMove<PlayerId, MaterialType, LocationType>): MaterialMove<PlayerId, MaterialType, LocationType>[] {
    if (move.type === ItemMoveType.Move && move.itemType === MaterialType.FactionCard) {

      // If card is dropped on a space where there is another card, swap them
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

        // TODO: Get all adjacent cards, and apply their "onMoveAdjacentCard" to handle cards like "the fear"
        return cardOnDestination.moveItems({ location: { ...sourceCard.location } })
      }
    }

    return []
  }

  onRuleEnd(): MaterialMove<PlayerId, MaterialType, LocationType>[] {
    if (this.initiative) return []

    // Clean the activations
    this.memorize<ActivationRuleMemory>({ activatedCards: [] }, this.player)

    // Apply end turn effect on card
    return discardCards(
      this
        .material(MaterialType.FactionCard)
        .location(onBattlefieldAndAstralPlane)
        .player(this.player),
      this.material(MaterialType.FactionToken),
      DiscardTiming.ActivationOrEndOfTurn
    )
  }

  onCustomMove(move: CustomMove): MaterialMove<PlayerId, MaterialType, LocationType>[] {
    if (move.type === CustomMoveType.Attack) {
      const attackerMaterial = this.material(MaterialType.FactionCard).index(move.data.card)
      const card = attackerMaterial.getItem()!
      const cardDescription = getFactionCardDescription(card.id.front)
      const effectHelper = new FactionCardEffectHelper(this.game)

      delete this.game.droppedItem

      this.memorizeCardPlayed({
        card: move.data.card,
        targets: move.data.targets,
        // TODO: why ?
        omnistrike: cardDescription.hasOmnistrike() && !effectHelper.hasLostAttributes(move.data.card, CardAttributeType.Omnistrike)
      })


      const rule = new AttackRule(this.game, attackerMaterial, cardDescription, move.data.card, effectHelper)
      const attackConsequences = rule.attack(move.data.targets)
      const deadOpponents = attackConsequences.filter(this.isDiscardFactionCard)
      if (deadOpponents.length === move.data.targets.length) {
        attackConsequences.push(this.rules().customMove(CustomMoveType.SolveAttack))
      }

      const moves = attackConsequences
      if (isSpell(cardDescription) && cardDescription.discardTiming === DiscardTiming.ActivationOrEndOfTurn) {
        moves.push(
          ...discardCard(
            attackerMaterial,
            this.material(MaterialType.FactionToken).parent(move.data.card)
          )
        )
      }

      return moves
    }

    if (move.type === CustomMoveType.SolveAttack) {
      this.memorize<ActivationRuleMemory>({ activatedCards: [] }, this.player)
    }

    /*if (move.type === CustomMoveType.CardAction) {
      const rule = getFactionCardRule(this.game, move.data.card)
      return rule.actionRule()
    }*/

    return []
  }

  isDiscardFactionCard = (move: MaterialMove) => {
    return isMoveItem(move) && move.itemType === MaterialType.FactionCard && move.position.location?.type === LocationType.PlayerDiscard
  }

  afterItemMove(move: ItemMove<PlayerId, MaterialType, LocationType>): MaterialMove<PlayerId, MaterialType, LocationType>[] {
    const moves: MaterialMove[] = []
    if (move.type !== ItemMoveType.Move || move.itemType !== MaterialType.FactionCard) return []

    if (move.position.location?.type === LocationType.Battlefield) {
      this.memorizeCardPlayed({ card: move.itemIndex })

      const battlefieldCards = this
        .material(MaterialType.FactionCard)
        .location(onBattlefieldAndAstralPlane)
      const opponentsCards = battlefieldCards.player((player) => player !== this.player)
      const cardMaterial = this.material(MaterialType.FactionCard).index(move.itemIndex)
      const card = getFactionCardDescription(cardMaterial.getItem()!.id.front)
      const effectHelper = new FactionCardEffectHelper(this.game)


      const rule = new AttackRule(this.game, cardMaterial, card, move.itemIndex, effectHelper)
      if (!rule.getLegalAttacks(opponentsCards)) {
        const token = this.material(MaterialType.FactionToken).parent(move.itemIndex)
        moves.push(...activateTokens(token))
      }
    }

    return moves
  }


}
