import { Faction } from '../../../../Faction'
import { Creature } from '../base/Creature'
import { movement } from '../../rules/attribute'

export class Xenodon extends Creature {
  faction = Faction.Nakka
  value = 3

  attack = 1
  defense = 1

  attribute = movement(2)
}
