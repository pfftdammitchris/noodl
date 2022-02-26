import { YAMLSeq } from 'yaml'

export default function createSeq(items: any[]) {
  const node = new YAMLSeq()
  items.forEach((item) => node.add(item))
  return node
}
