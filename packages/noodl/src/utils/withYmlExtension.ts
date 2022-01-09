export default function withYmlExtension(s = '') {
  return !s.endsWith('.yml') && (s += '.yml')
}
