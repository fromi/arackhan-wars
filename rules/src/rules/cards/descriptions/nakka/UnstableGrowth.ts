import { adjacent, allied, creature } from '../utils/applicable-filter.utils'
import { Spell } from '../base/Spell'
import { Faction } from '../../../../Faction'
import { attack } from '../base/Ability'

export class UnstableGrowth extends Spell {
  faction = Faction.Nakka

  value = 2

  effect = attack(+2).defense(-1).to(adjacent, allied, creature)
}
