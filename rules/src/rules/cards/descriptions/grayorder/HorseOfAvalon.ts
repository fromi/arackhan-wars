import { FactionCard } from '../../../../material/FactionCard'
import { Spell } from '../base/Spell'
import { Faction } from '../../../../Faction'
import { DiscardTiming } from '../base/FactionCardDetail'
import { RuleId } from '../../../RuleId'

export class HorseOfAvalon extends Spell {
  faction = Faction.GrayOrder

  id = FactionCard.HorseOfAvalon
  value = 7

  actionRule = RuleId.HorseOfAvalonActionRule

  discardTiming = DiscardTiming.ActivationOrEndOfTurn
}
