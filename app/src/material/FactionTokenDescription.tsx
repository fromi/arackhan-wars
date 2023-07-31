import { Faction } from '@gamepark/arackhan-wars/Faction'

import WhitelandToken from '../images/tokens/whitelands-token-front.jpg'
import NakkaToken from '../images/tokens/nakka-token-front.jpg'
import GreyOrderToken from '../images/tokens/greyorder-token-front.jpg'
import BlightToken from '../images/tokens/blight-token-front.jpg'
import WhitelandTokenBack from '../images/tokens/whitelands-token-back.jpg'
import NakkaTokenBack from '../images/tokens/nakka-token-back.jpg'
import GreyOrderTokenBack from '../images/tokens/greyorder-token-back.jpg'
import BlightTokenBack from '../images/tokens/blight-token-back.jpg'
import { FactionTokenRules } from './FactionTokenRules'
import { MaterialContext, RoundTokenDescription } from '@gamepark/react-game'
import { LocationType } from '@gamepark/arackhan-wars/material/LocationType'
import { MaterialItem } from '@gamepark/rules-api'
import { Memory } from '@gamepark/arackhan-wars/rules/Memory'

export class FactionTokenDescription extends RoundTokenDescription {
  diameter = 1.4

  images = {
    [Faction.Whitelands]: WhitelandToken,
    [Faction.Nakka]: NakkaToken,
    [Faction.GreyOrder]: GreyOrderToken,
    [Faction.Blight]: BlightToken
  }

  backImages = {
    [Faction.Whitelands]: WhitelandTokenBack,
    [Faction.Nakka]: NakkaTokenBack,
    [Faction.GreyOrder]: GreyOrderTokenBack,
    [Faction.Blight]: BlightTokenBack
  }

  getStaticItems = ({ game }: MaterialContext) => {
    return game.players.map((player) => ({
      id: game.memory[Memory.Faction][player],
      quantity: 34,
      location: {
        type: LocationType.PlayerTokenStock,
        player
      }
    }))
  }

  getStockLocation(item: MaterialItem) {
    return {
      type: LocationType.PlayerTokenStock,
      player: item.location.player
    }
  }

  rules = FactionTokenRules
}

export const factionTokenDescription = new FactionTokenDescription()
