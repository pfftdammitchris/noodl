export default {
  localAddress: /(127.0.0.1|localhost)/i,
  reference: {
    at: {
      apply: /[a-zA-Z0-9]+@$/,
    },
    dot: {
      single: {
        root: /(^\.[A-Z])/,
        localRoot: /^([\s]*\.[a-z])/,
      },
      double: {
        root: /(^\.\.[A-Z])/,
        localRoot: /^([\s]*\.\.[a-z])/,
      },
    },
    eq: {
      eval: /^[\s]*=([a-zA-Z]+|\.{1,2}[a-zA-Z]+)/,
    },
    underline: {
      traverse: /([\.][_]+[a-zA-Z])/,
    },
  },
  video: /\.(avi|bmp|gif|jpg|jpeg|png|tif|tiff|mp4)$/i,
}
