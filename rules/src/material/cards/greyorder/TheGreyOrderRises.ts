import { Faction } from '../../Faction'
import { Spell } from '../Spell'

export class TheGreyOrderRises extends Spell {
  faction = Faction.GreyOrder
  legendary = true
  value = 8

  astral = true

  // TODO action
}
