import { getCardRule } from '../CardRule'
import { ReplaceWithCreatureActionRule } from './ReplaceWithCreatureActionRule'

export class NoviceFairyActionRule extends ReplaceWithCreatureActionRule {
  getEligibleCards() {
    return super.getEligibleCards().filter((_, index) => getCardRule(this.game, index).value <= 5)
  }
}
