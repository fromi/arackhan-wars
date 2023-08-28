/** @jsxImportSource @emotion/react */
import { MaterialType } from '@gamepark/arackhan-wars/material/MaterialType'
import { LocationType } from '@gamepark/arackhan-wars/material/LocationType'
import { ItemLocator, LocationDescription } from '@gamepark/react-game'
import { PlayerId } from '@gamepark/arackhan-wars/ArackhanWarsOptions'
import { css } from '@emotion/react'
import { Location } from '@gamepark/rules-api'
import { AttributeType } from '@gamepark/arackhan-wars/material/cards/Attribute'
import initiative from '../images/icons/attributes/initiative.png'
import initiativeCancel from '../images/icons/attributes/initiative-cancel.png'
import movement from '../images/icons/attributes/movement.png'
import movementCancel from '../images/icons/attributes/movement-cancel.png'
import flight from '../images/icons/attributes/flight.png'
import flightCancel from '../images/icons/attributes/flight-cancel.png'
import omnistrike from '../images/icons/attributes/omnistrike.png'
import omnistrikeCancel from '../images/icons/attributes/omnistrike-cancel.png'
import rangedAttack from '../images/icons/attributes/ranged-attack.png'
import rangedAttackCancel from '../images/icons/attributes/ranged-attack-cancel.png'
import swarm from '../images/icons/attributes/swarm.png'
import swarmCancel from '../images/icons/attributes/swarm-cancel.png'
import regeneration from '../images/icons/attributes/regeneration.png'
import regenerationCancel from '../images/icons/attributes/regeneration-cancel.png'
import stealth from '../images/icons/attributes/stealth.png'
import stealthCancel from '../images/icons/attributes/stealth-cancel.png'
import perforation from '../images/icons/attributes/perforation.png'
import perforationCancel from '../images/icons/attributes/perforation-cancel.png'

export class AttributesIconsLocator extends ItemLocator<PlayerId, MaterialType, LocationType> {
  locationDescription = attributesIconDescription
  parentItemType = MaterialType.FactionCard

  getPositionOnParent(location: Location<PlayerId, LocationType>) {
    return { x: 18 + location.x! * 15, y: 87 }
  }
}

class AttributesIconsDescription extends LocationDescription<PlayerId, MaterialType, LocationType> {
  width = 1
  ratio = 200 / 172

  attributeImages = {
    [AttributeType.Initiative]: initiative,
    [AttributeType.Movement]: movement,
    [AttributeType.Flight]: flight,
    [AttributeType.Omnistrike]: omnistrike,
    [AttributeType.RangedAttack]: rangedAttack,
    [AttributeType.Swarm]: swarm,
    [AttributeType.Regeneration]: regeneration,
    [AttributeType.Stealth]: stealth,
    [AttributeType.Perforation]: perforation
  }

  attributeCancelImages = {
    [AttributeType.Initiative]: initiativeCancel,
    [AttributeType.Movement]: movementCancel,
    [AttributeType.Flight]: flightCancel,
    [AttributeType.Omnistrike]: omnistrikeCancel,
    [AttributeType.RangedAttack]: rangedAttackCancel,
    [AttributeType.Swarm]: swarmCancel,
    [AttributeType.Regeneration]: regenerationCancel,
    [AttributeType.Stealth]: stealthCancel,
    [AttributeType.Perforation]: perforationCancel
  }

  getImage(location: Location<PlayerId, LocationType>) {
    return location.id.cancel ? this.attributeCancelImages[location.id.type] : this.attributeImages[location.id.type]
  }

  extraCss = css`
    pointer-events: none;
  `
}

export const attributesIconDescription = new AttributesIconsDescription()