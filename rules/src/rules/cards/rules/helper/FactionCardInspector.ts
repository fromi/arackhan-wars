import { Ability, isWithConsequences, EffectRule } from '../../descriptions/base/Ability'
import { isLooseSkillEffect } from '../effect/LooseSkillsEffect'
import { CardAttributeType, FactionCardCharacteristics } from '../../descriptions/base/FactionCardCharacteristics'
import { isLooseAttributesEffect } from '../effect/LooseAttributesEffect'
import { isLand } from '../../descriptions/base/Land'
import { isSpell } from '../../descriptions/base/Spell'
import { isCreature } from '../../descriptions/base/Creature'
import { isValueModifierEffect, ValueModifierEffect } from '../effect/ValueModifierEffect'
import sumBy from 'lodash/sumBy'
import { isAttackEffect } from '../../descriptions/base/AttackEffect'
import { Material, MaterialGame, MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { MaterialType } from '../../../../material/MaterialType'
import { getCharacteristics } from '../../../../material/FactionCard'
import { onBattlefieldAndAstralPlane } from '../../../../utils/LocationUtils'
import { isAttackAttribute } from '../attribute/AttackAttribute'
import sum from 'lodash/sum'
import { Attribute } from '../attribute/Attribute'

export class FactionCardInspector extends MaterialRulesPart {
  readonly cardsEffects: Record<number, EffectRule[]> = {}
  readonly battlefield: Material

  constructor(game: MaterialGame) {
    super(game)
    this.battlefield = this.material(MaterialType.FactionCard).location(onBattlefieldAndAstralPlane)
    this.cardsEffects = this.computeCardEffects()
  }

  computeCardEffects(): Record<number, EffectRule[]> {
    const modifications: Record<number, EffectRule[]> = this.computeBlockedEffects()
    const battlefieldIndexes = this.battlefield.getIndexes()

    for (const cardIndex of battlefieldIndexes) {
      const originalCard = this.material(MaterialType.FactionCard).index(cardIndex)
      const characteristics = getCharacteristics(cardIndex, this.game)
      const abilities = this.getAbilities(characteristics, this.hasLostSkill(cardIndex, modifications))


      const attributes = characteristics.getAttributes()
        .filter(isAttackAttribute)

      for (const otherCardIndex of battlefieldIndexes) {
        const otherCardMaterial = this.material(MaterialType.FactionCard).index(otherCardIndex)
        // TODO: before appliying passing effect, eschange card characteristics but keep the location
        this.applyAbilities(abilities, originalCard, otherCardMaterial, modifications, otherCardIndex)
        this.applyAttributes(attributes, originalCard, otherCardMaterial, modifications, otherCardIndex)
      }
    }
    return modifications
  }

  private applyAttributes(attributes: Attribute[], cardMaterial: Material, otherCardMaterial: Material, modifications: Record<number, EffectRule[]>, otherCardIndex: number) {
    const attackBonuses = attributes
      .filter((a) => !this.hasLostAttributes(cardMaterial.getIndex(), a.type))
      .flatMap((a) => a.getAttributeRule(this.game).getAbilities?.(cardMaterial, otherCardMaterial) ?? [])

    if (attackBonuses.length) {
      if (!modifications[otherCardIndex]) modifications[otherCardIndex] = []
      modifications[otherCardIndex].push(new ValueModifierEffect(this.game, { attack: sum(attackBonuses) }))
    }
  }

  private applyAbilities(abilities: Ability[], cardMaterial: Material, otherCardMaterial: Material, modifications: Record<number, EffectRule[]>, otherCardIndex: number) {
    const effects = abilities
      .filter((e) => e.isApplicable(this.game, cardMaterial, otherCardMaterial))
      .map((e) => e.getEffectRule(this.game))

    if (effects.length) {
      if (!modifications[otherCardIndex]) modifications[otherCardIndex] = []
      modifications[otherCardIndex].push(...effects)
    }
  }

  computeBlockedEffects(): Record<number, EffectRule[]> {
    const modifications: Record<number, EffectRule[]> = {}
    const battlefieldIndexes = this.battlefield.getIndexes()
    for (const cardIndex of battlefieldIndexes) {
      const cardMaterial = this.material(MaterialType.FactionCard).index(cardIndex)
      const characteristics = getCharacteristics(cardIndex, this.game)

      for (const otherCardIndex of battlefieldIndexes) {
        if (otherCardIndex === cardIndex) continue

        const otherCardMaterial = this.material(MaterialType.FactionCard).index(otherCardIndex)
        const effects = this.getAbilities(characteristics)
          .filter((e) => e.isApplicable(this.game, cardMaterial, otherCardMaterial))
          .map((e) => e.getEffectRule(this.game))
          .filter(isLooseSkillEffect)

        if (effects.length) {
          if (!modifications[otherCardIndex]) modifications[otherCardIndex] = []

          modifications[otherCardIndex].push(...effects)
        }
      }
    }
    return modifications
  }

  getAbilities(description: FactionCardCharacteristics, isSkillDisabled?: boolean) {
    if (isCreature(description)) {
      return description.getAbilities(isSkillDisabled)
    }
    return description.getAbilities()

  }

  hasLostSkill(cardIndex: number, modifications?: Record<number, EffectRule[]>): boolean {
    const cardsEffects = modifications ?? this.cardsEffects

    if (!(cardIndex in cardsEffects)) return false
    return cardsEffects[cardIndex].some((e) => isLooseSkillEffect(e))
  }

  hasLostAttributes(cardIndex: number, attribute: CardAttributeType, modifications?: Record<number, EffectRule[]>): boolean {
    const cardsEffects = modifications ?? this.cardsEffects

    if (!(cardIndex in cardsEffects)) return false
    return cardsEffects[cardIndex].some((e) => isLooseAttributesEffect(e) && e.hasLostAttribute(attribute))
  }

  getAttack(cardIndex: number): number {
    const characteristics = getCharacteristics(cardIndex, this.game)
    if (!isSpell(characteristics) && !isCreature(characteristics)) return 0
    const baseAttack = characteristics.attack ?? 0

    if (!(cardIndex in this.cardsEffects)) return baseAttack
    const valueModifierEffects = this.cardsEffects[cardIndex].filter(isValueModifierEffect)
    return baseAttack + sumBy(valueModifierEffects, (e) => e.getBonus().attack ?? 0)
  }

  getDefense(cardIndex: number): number {
    const cardDescription = getCharacteristics(cardIndex, this.game)
    if (!isLand(cardDescription) && !isCreature(cardDescription)) return 0
    const baseDefense = cardDescription.defense ?? 0
    if (!(cardIndex in this.cardsEffects)) return baseDefense
    const valueModifierEffects = this.cardsEffects[cardIndex].filter(isValueModifierEffect)
    return baseDefense + sumBy(valueModifierEffects, (e) => e.getBonus().defense ?? 0)
  }

  afterAttack(cardIndex: number): MaterialMove[] {
    if (!(cardIndex in this.cardsEffects)) return []
    return this.cardsEffects[cardIndex]
      .filter(isAttackEffect)
      .flatMap((e) => e.getAttackConsequences(this.material(MaterialType.FactionCard).index(cardIndex)))
  }

  canAttack(attackerIndex: number, targetIndex: number): boolean {
    if (!(attackerIndex in this.cardsEffects)) return true
    // TODO: other attackers ?
    return !this.cardsEffects[attackerIndex].filter(isAttackEffect).some((e) => !e.canAttack(attackerIndex, targetIndex, [], this.game))
  }

  canBeAttacked(attackerIndex: number, targetIndex: number): boolean {
    if (!(targetIndex in this.cardsEffects)) return true
    // TODO: other attackers ?
    return !this.cardsEffects[targetIndex].filter(isAttackEffect).some((a) => !a.canBeAttacked(attackerIndex, targetIndex, [], this.game))
  }

  onCasterMoveTo(casterIndex: number, targetIndex: number): MaterialMove[] {
    if (!(targetIndex in this.cardsEffects)) return []
    this.cardsEffects[targetIndex]
      .flatMap((effect) => {
        if (!isWithConsequences(effect)) return []
        const caster = this.material(MaterialType.FactionCard).index(casterIndex)!
        const target = this.material(MaterialType.FactionCard).index(targetIndex)!
        return effect.onCasterMoveTo(caster, target)
      })

    return []
  }

  onCasterMoveAway(casterIndex: number, targetIndex: number): MaterialMove[] {
    if (!(targetIndex in this.cardsEffects)) return []
    this.cardsEffects[targetIndex]
      .flatMap((effect) => {
        if (!isWithConsequences(effect)) return []
        const caster = this.material(MaterialType.FactionCard).index(casterIndex)!
        const target = this.material(MaterialType.FactionCard).index(targetIndex)!
        return effect.onCasterMoveAway(caster, target)
      })

    return []
  }

  getAttackForOpponent(attacker: Material, opponent: Material, baseAttack: number) {
    const attackerIndex = attacker.getIndex()
    const characteristics = getCharacteristics(attackerIndex, this.game)
    characteristics.getAttributes()
      .filter(isAttackAttribute)
      .filter((a) => !this.hasLostAttributes(attackerIndex, a.type))
      .forEach((a) => baseAttack = a.getAttributeRule(this.game).getAttackValue(baseAttack, attacker, opponent))

    return baseAttack
  }
}
