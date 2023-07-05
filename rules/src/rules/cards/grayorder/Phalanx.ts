import { FactionCardKind } from '../FactionCardRule'
import { GrayOrderCardRule } from './GrayOrderCardRule'
import { FactionCardType } from '../../../material/FactionCardType'

export class Phalanx extends GrayOrderCardRule {
  kind = FactionCardKind.Creature
  type = FactionCardType.Phalanx
  attack = 1
  defense = 1
  quantity = 3
}
