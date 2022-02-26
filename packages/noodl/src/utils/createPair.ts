import{Pair} from 'yaml'

export default function createPair(key: string, value: any) {
  return new Pair(key, value)
}