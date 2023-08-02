import { OptionsSpec } from '@gamepark/rules-api'
import { TFunction } from 'i18next'
import { Faction, playerFactions } from './Faction'

/**
 * This is the options for each player in the game.
 */
export type PlayerId = number
export type  PlayerOptions = {
  faction?: Faction
}

/**
 * This is the type of object that the game receives when a new game is started.
 * The first generic parameter, "{}", can be changed to include game options like variants or expansions.
 */
export type ArackhanWarsOptions = {
  players: PlayerOptions[]
}

/**
 * This object describes all the options a game can have, and will be used by GamePark website to create automatically forms for you game
 * (forms for friendly games, or forms for matchmaking preferences, for instance).
 */
export const GameOptionsSpec: OptionsSpec<ArackhanWarsOptions> = {
  players: {
    faction: {
      label: (t: TFunction) => t('Player faction'),
      values: playerFactions,
      valueSpec: (faction: Faction) => ({ label: (t: TFunction) => getPlayerName(faction, t) })
    }
  }
}

export function getPlayerName(playerId: PlayerId, t: TFunction) {
  return t('Player {playerId}', { playerId })
}
