import { NOODL, NOODLComponent, NOODLComponentProps } from 'noodl-ui'
import {
  Room,
  Participant,
  LocalParticipant,
  RemoteParticipant,
} from 'twilio-video'
import Modal from 'components/NOODLModal'
import Meeting from '../../meeting'
import { App } from '../../app'

declare module 'redux-logger'

declare global {
  interface Window {
    // client.ts
    // index.ts
    account: any
    noodl: any
    env: string | undefined
    getByDataUX: any
    getDataValues: any
    components: NOODLComponent[]
    pcomponents: NOODLComponentProps[]
    meeting: Meeting
    modal: Modal
    noodlui: NOODL
    room: Room | null
    streams: any
    // noodl-ui
    // twilio-video
    twilio: any
  }
}
