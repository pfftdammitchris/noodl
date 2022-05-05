import y from 'yaml'

class Page extends y.Document {
  constructor(
    value?: any,
    options?: y.DocumentOptions &
      y.SchemaOptions &
      y.ParseOptions &
      y.CreateNodeOptions,
  ) {
    super(value, options)
  }
}

export default Page
