import _ from 'lodash'
import { forEachEntries, formatColor } from '../utils/common'
import { Resolver } from '../types'

/**
 * Returns a new object with some keywords changed to align more with html/css/etc
 * Also converts color values like 0x00000000 to #00000000
 * @param { Component } component
 * @param { ResolverConsumerOptions } options
 * @return { void }
 */
const getColors: Resolver = (component) => {
  const style = component.get('style')

  if (style) {
    forEachEntries(style, (key, value) => {
      if (_.isString(value)) {
        if (value.startsWith('0x')) {
          // Rename textColor to color
          if (key === 'textColor') {
            // TODO: This shouldn't be disabled but enabling this makes some text white which
            //    becomes invisible on the page. Find out the solution to getting this right
            // result['textColor'] = value.replace('0x', '#')
            component.setStyle('color', formatColor(value))
          } else {
            // Convert other keys if they aren't formatted as well just in case
            // textColor for "color" attr is handled above
            component.setStyle(key, formatColor(value))
          }
        }
      }
    })
  }
}

export default getColors