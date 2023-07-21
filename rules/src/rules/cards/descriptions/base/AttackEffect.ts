import { PassiveEffect } from './Effect'
import { MaterialMove } from '@gamepark/rules-api/dist/material/moves/MaterialMove'
import { Material } from '@gamepark/rules-api/dist/material/items/Material'

export class AttackEffect extends PassiveEffect {
  /**
   * Used in legal moves to know if the player can declare an attack on the opponent
   * Used for the opponent
   */
  canBeAttacked(_attacker: number, _opponent: number, _otherAttackers: number[] = []): boolean {
    return true
  }

  /**
   *
   * Used in legal moves to know if the player can declare an attack on the opponent
   * Used for the attacker
   */
  canAttack(_attacker: number, _opponent: number, _otherAttackers: number[] = []): boolean {
    return true
  }

  /**
   * Only for carnivorous plant. Used in attack resolution (if not valid => attack = 0)
   */
  isValidAttack(_attackers: number[]): boolean {
    return true
  }

  getAttackValue(_attackers: number[]): number {
    return 0
  }

  getAttackConsequences(_attacker: Material): MaterialMove[] {
    return []
  }
}

export const isAttackEffect = (effect: PassiveEffect): effect is AttackEffect => (typeof effect as any).canBeAttacked === 'function'
