import _ from 'lodash'
import { NOODLElement } from 'app/types/pageTypes'
import { RoomParticipant } from 'app/types'
import Stream from './Stream'
import Substreams from './Substreams'
import { NOODLComponentProps } from 'noodl-ui'

class MeetingStreams {
  #mainStream: Stream
  #selfStream: Stream
  #subStreams: Substreams | null = null

  constructor() {
    this.#mainStream = new Stream('mainStream')
    this.#selfStream = new Stream('selfStream')
  }

  getMainStream() {
    return this.#mainStream
  }

  getSelfStream() {
    return this.#selfStream
  }

  isMainStreaming(participant: RoomParticipant) {
    return this.#mainStream.isSameParticipant(participant)
  }

  isSelfStreaming(participant: RoomParticipant) {
    return this.#selfStream.isSameParticipant(participant)
  }

  isSubStreaming(participant: RoomParticipant) {
    return this.#subStreams?.participantExists(participant)
  }

  subStreamsContainerExists() {
    return this.#subStreams instanceof Substreams
  }

  createSubStreamsContainer(
    container: NOODLElement,
    props: NOODLComponentProps,
  ) {
    this.#subStreams = new Substreams(container, props)
    return this.#subStreams
  }

  getSubStreamsContainer() {
    return this.#subStreams
  }
}

export default MeetingStreams
