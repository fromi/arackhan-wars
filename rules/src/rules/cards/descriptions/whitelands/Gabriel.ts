import { Faction } from '../../../../Faction'
import { Creature } from '../base/Creature'
import { initiative } from '../../rules/attribute'

export class Gabriel extends Creature {
  faction = Faction.Whitelands
  legendary = true
  value = 10

  attack = 3
  defense = 2

  attribute = initiative
}
