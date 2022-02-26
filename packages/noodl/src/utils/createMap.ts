import { YAMLMap } from 'yaml'

export default function createMap(props: Record<string, any>) {
  const node = new YAMLMap()
  Object.entries(props).forEach(([k, v]) => node.set(k, v))
  return node
}
