import _ from 'lodash'
import { NOODLComponent, NOODLComponentProps } from 'noodl-ui'
import { NOODLElement } from 'app/types/pageTypes'
import { RemoteParticipant } from 'twilio-video'
import { RoomParticipant } from 'app/types'
import Logger from 'app/Logger'
import Stream from './Stream'

const log = Logger.create('Substreams.ts')

/** The container for subStreams */
class MeetingSubstreams {
  #subStreams: Stream[] = []
  blueprint: Partial<NOODLComponent> = {} // Experimental
  container: NOODLElement

  constructor(container: NOODLElement, props: NOODLComponentProps) {
    this.container = container
    this.blueprint = props.blueprint
  }

  get length() {
    return this.#subStreams.length
  }

  /**
   * Adds a new stream instance to the subStreams collection. If a node was passed in
   * it will be inserted into the DOM. If a participant was passed in their media
   * tracks will attempt to automatically start
   * @param { NOODLElement | undefined } node
   * @param { RemoteParticipant | undefined } participant
   */
  create({
    node,
    participant,
  }: { node?: NOODLElement; participant?: RemoteParticipant } = {}) {
    const stream = new Stream('subStream', { node })
    if (node) {
      stream.setElement(node)
      if (!this.container.contains(node)) {
        this.container.appendChild(node)
      }
    }
    // Apply the blueprint onto the new node to align with the current items
    this.addToCollection(stream)
    if (participant) {
      stream.setParticipant(participant)
    }
    return this
  }

  /**
   * Inserts/pushes a stream into the subStreams collection
   * If an index is passed in, it will insert the stream at the index position
   * @param { Stream } stream
   * @param { number | undefined } index
   */
  addToCollection(stream: Stream, index?: number) {
    if (!this.#subStreams.includes(stream)) {
      if (_.isNumber(index)) {
        this.#subStreams.splice(index, 0, stream)
      } else {
        this.#subStreams.push(stream)
      }
    } else {
      log.func('addToCollection')
      log.orange('The stream is already in the subStreams collection', {
        stream,
        subStreams: this.#subStreams,
      })
    }
    return this
  }

  /**
   * Returns true if the element is already bound to a subStream in the
   * collection
   * @param { NOODLElement } node
   */
  elementExists(node: NOODLElement) {
    return _.some(this.#subStreams, (subStream: Stream) => {
      return subStream.isSameElement(node)
    })
  }

  /**
   * Returns true if the participant is already bound to a subStream in
   * the collection
   * @param { RoomParticipant } participant
   */
  participantExists(participant: RoomParticipant) {
    return _.some(this.#subStreams, (subStream: Stream) => {
      return subStream.isSameParticipant(participant)
    })
  }

  /**
   * Returns the stream from the subStreams collection, null otherwise
   * @param { RoomParticipant } participant
   */
  getSubStream(participant: RoomParticipant) {
    const fn = (subStream: Stream) => subStream.isSameParticipant(participant)
    return this.findBy(fn)
  }

  /**
   * Loops over the subStreams collection and returns the first stream where
   * the predicate function returns truthy
   * @param { Stream } stream
   */
  findBy(cb: (stream: Stream) => boolean) {
    return _.find(this.#subStreams, cb)
  }

  /**
   * Removes the given stream from the subStreams collection
   * If stream was passed as an index then it is used as the index to remove
   * the stream that is found at that position in the collection
   * @param { Stream | number } stream - Stream or index to remove
   */
  removeSubStream(stream: Stream): this
  removeSubStream(index: number): this
  removeSubStream(stream: Stream | number) {
    if (stream instanceof Stream) {
      const fn = (s: Stream) => s !== stream
      this.#subStreams = _.filter(this.#subStreams, fn)
    } else if (_.isNumber(stream)) {
      const index = stream
      if (_.inRange(index, 0, this.#subStreams.length)) {
        this.#subStreams.splice(index, 1)
      }
    }
    return this
  }

  /** Returns the first subStream in the collection */
  first() {
    return this.#subStreams[0]
  }

  /** Returns the last subStream in the collection */
  last() {
    return _.last(this.#subStreams)
  }
}

export default MeetingSubstreams
