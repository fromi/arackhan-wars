import { Faction } from '../../Faction'
import { Spell } from '../Spell'

export class Possession extends Spell {
  faction = Faction.Blight
  legendary = true
  value = 4

  astral = true

  // TODO action
}
