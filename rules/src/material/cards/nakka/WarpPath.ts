import { Faction } from '../../Faction'
import { Spell } from '../Spell'

export class WarpPath extends Spell {
  faction = Faction.Nakka
  value = 3

  astral = true

  // TODO action
}
