import { attributeTypes } from '@gamepark/arackhan-wars/material/cards/Attribute'
import { isCreature } from '@gamepark/arackhan-wars/material/cards/Creature'
import { FactionCardCharacteristics } from '@gamepark/arackhan-wars/material/cards/FactionCardCharacteristics'
import { isLand } from '@gamepark/arackhan-wars/material/cards/Land'
import { isSpell } from '@gamepark/arackhan-wars/material/cards/Spell'
import { Faction } from '@gamepark/arackhan-wars/material/Faction'
import { FactionCard, FactionCardsCharacteristics } from '@gamepark/arackhan-wars/material/FactionCard'
import { LocationType } from '@gamepark/arackhan-wars/material/LocationType'
import { MaterialType } from '@gamepark/arackhan-wars/material/MaterialType'
import { RuleId } from '@gamepark/arackhan-wars/rules/RuleId'
import {
  CustomMove,
  FillGapStrategy,
  isEnumValue,
  isMoveItemType,
  ItemMove,
  MaterialGameSetup,
  MaterialMove,
  MaterialRules,
  PlayerTurnRule
} from '@gamepark/rules-api'
import difference from 'lodash/difference'
import range from 'lodash/range'
import { DeckbuildingFilter, deckbuildingFilters } from './DeckbuildingFilter'

const Page = 100
const PageSize = 18
const DeckSize = 23

export enum DeckbuildingMove {
  ChangeFilter = 1, ChangePage
}

export class DeckbuildingRules extends MaterialRules<number, MaterialType, LocationType> {

  static local = true

  locationsStrategies = {
    [MaterialType.FactionCard]: {
      [LocationType.DeckbuildingBook]: new FillGapStrategy()
    }
  }

  rules = {
    [RuleId.Deckbuilding]: DeckbuildingRule
  }

  itemsCanMerge() {
    return false
  }

  changeFilter(filter: DeckbuildingFilter) {
    return new DeckbuildingRule(this.game).rules().customMove(DeckbuildingMove.ChangeFilter, filter)
  }

  changePage(page: number) {
    return new DeckbuildingRule(this.game).rules().customMove(DeckbuildingMove.ChangePage, page)
  }

  get page() {
    return new DeckbuildingRule(this.game).page
  }

  get maxPage() {
    return new DeckbuildingRule(this.game).maxPage
  }
}

class DeckbuildingRule extends PlayerTurnRule<number, MaterialType, LocationType> {
  getPlayerMoves() {
    const bookCards = this.material(MaterialType.FactionCard).location(LocationType.DeckbuildingBook)
    const deckCards = this.material(MaterialType.FactionCard).location(LocationType.PlayerDeck)
    return [
      ...range(0, DeckSize).flatMap(x => bookCards.moveItems({ type: LocationType.PlayerDeck, x })),
      ...deckbuildingFilters.map(filter => this.rules().customMove(DeckbuildingMove.ChangeFilter, filter)),
      ...difference(range(1, this.maxPage + 1), [this.page]).map(page => this.rules().customMove(DeckbuildingMove.ChangePage, page)),
      ...range(0, DeckSize).flatMap(x => {
        const cardAtX = deckCards.location(l => l.x === x)
        if (!cardAtX.length) return []
        return range(0, DeckSize).filter(i => i !== x).map(x => cardAtX.moveItem({ type: LocationType.PlayerDeck, x }))
      })
    ]
  }

  get page() {
    return this.remind(Page) ?? 1
  }

  get maxPage() {
    return Math.floor(new DeckbuildingRule(this.game).cards.length / PageSize) + 1
  }

  beforeItemMove(move: ItemMove) {
    const moves: MaterialMove[] = []
    if (!isMoveItemType(MaterialType.FactionCard)(move)) return []
    const movedCard = this.material(MaterialType.FactionCard).getItem(move.itemIndex)
    const replacedCard = this.material(MaterialType.FactionCard).location(LocationType.PlayerDeck).location(l => l.x === move.location.x)
    if (movedCard?.location.type === LocationType.DeckbuildingBook) {
      moves.push(this.material(MaterialType.FactionCard).createItem(movedCard))
      if (replacedCard.length) {
        moves.push(replacedCard.deleteItem())
      }
    } else if (replacedCard.length) {
      moves.push(replacedCard.moveItem({ type: LocationType.PlayerDeck, x: movedCard?.location.x }))
    }
    return moves
  }

  onCustomMove(move: CustomMove) {
    if (move.type === DeckbuildingMove.ChangeFilter) {
      this.memorize<boolean>(move.data, value => !value)
      this.memorize<number>(Page, 1)
      if (move.data === DeckbuildingFilter.Spell && !this.remind(DeckbuildingFilter.Spell)) {
        this.memorize(DeckbuildingFilter.Astral, false)
      } else if (move.data === DeckbuildingFilter.Astral && this.remind(DeckbuildingFilter.Astral)) {
        this.memorize(DeckbuildingFilter.Spell, true)
      }
    } else if (move.type === DeckbuildingMove.ChangePage) {
      this.memorize<number>(Page, move.data)
    }
    const page = this.page
    return [
      this.material(MaterialType.FactionCard).createItemsAtOnce(this.cards.slice((page - 1) * PageSize, page * PageSize).map((card, x) => (
        { id: { front: card }, location: { type: LocationType.DeckbuildingBook, x } }
      ))),
      this.material(MaterialType.FactionCard).location(LocationType.DeckbuildingBook).deleteItemsAtOnce()
    ]
  }

  get cards() {
    return allCards.filter(card => this.filterCard(card))
  }

  filterCard(card: FactionCard) {
    const characteristics = FactionCardsCharacteristics[card]
    return this.factionFilter(characteristics.faction)
      && this.typeFilter(characteristics)
      && this.attributesFilter(characteristics)
  }

  factionFilter(faction: Faction) {
    const whitelands = this.remind(DeckbuildingFilter.Whitelands)
    const nakka = this.remind(DeckbuildingFilter.Nakka)
    const greyOrder = this.remind(DeckbuildingFilter.GreyOrder)
    const blight = this.remind(DeckbuildingFilter.Blight)
    if (!whitelands && !nakka && !greyOrder && !blight) return true
    switch (faction) {
      case Faction.Whitelands:
        return whitelands
      case Faction.Nakka:
        return nakka
      case Faction.GreyOrder:
        return greyOrder
      case Faction.Blight:
        return blight
    }
  }

  typeFilter(characteristics: FactionCardCharacteristics) {
    const creature = this.remind(DeckbuildingFilter.Creature)
    const land = this.remind(DeckbuildingFilter.Land)
    const spell = this.remind(DeckbuildingFilter.Spell)
    if (!creature && !land && !spell) return true
    if (!creature && isCreature(characteristics)) return false
    if (!land && isLand(characteristics)) return false
    if (!spell && isSpell(characteristics)) return false
    return !this.remind(DeckbuildingFilter.Astral) || (isSpell(characteristics) && characteristics.astral)
  }

  attributesFilter(characteristics: FactionCardCharacteristics) {
    if (!attributeTypes.some(attributeType => this.remind(attributeType + 10))) return true
    for (const attributeType of attributeTypes) {
      if (this.remind(attributeType + 10) && characteristics.getAttributes().some(attribute => attribute.type === attributeType)) {
        return true
      }
    }
    return false
  }
}

export class DeckBuildingSetup extends MaterialGameSetup<number, MaterialType, LocationType> {
  Rules = DeckbuildingRules

  setupMaterial(_options: any) {
    this.material(MaterialType.FactionCard).createItemsAtOnce(
      allCards.slice(0, 18).map(card => (
        { id: { front: card }, location: { type: LocationType.DeckbuildingBook } }
      ))
    )
  }

  start() {
    this.startPlayerTurn(RuleId.Deckbuilding, 1)
  }
}

const allCards = Object.values(FactionCard).filter(isEnumValue)