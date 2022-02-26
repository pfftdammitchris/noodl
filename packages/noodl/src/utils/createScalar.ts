import { Scalar } from 'yaml'

export default function createScalar(value: any) {
  return new Scalar(value)
}
