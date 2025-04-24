const path = require("path")
const HtmlWebpack = require("html-webpack-plugin")
const CopyWebpack = require("copy-webpack-plugin")
const { execSync } = require('child_process')

// Get CloudFormation parameters
const cfParams = Object.fromEntries(
  execSync('bash get-cf-params.sh', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .map(line => {
      const [key, value] = line.split('=')
      return [key, JSON.stringify(value.trim())]
    })
)

module.exports = {
  entry: {
    visible: {
      import: "./src/scripts/visible.js",
      dependOn: "shared"
    },
    shared: "./src/scripts/shared.js"
  },
  mode: "development",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "scripts/[name].bundle.js"
  },
  plugins: [
    new HtmlWebpack({
      title: "Sat Finder",
      filename: "index.html",
      template: "./src/index.html",
      chunks: ["shared"]
    }),
    new HtmlWebpack({
      title: "Visible",
      filename: "visible.html",
      template: "./src/visible.html",
      chunks: ["shared", "visible"]
    }),
    new HtmlWebpack({
      title: "Calibration",
      filename: "calibrate.html",
      template: "./src/calibrate.html",
      chunks: ["shared"]
    }),
    new HtmlWebpack({
      title: "Nearby",
      filename: "nearby.html",
      template: "./src/nearby.html",
      chunks: ["shared"]
    }),
    new HtmlWebpack({
      title: "About",
      filename: "about.html",
      template: "./src/about.html",
      chunks: ["shared"]
    }),
    new CopyWebpack({
      patterns: [
        {
          from: "./src/images",
          to: "assets",
        },
      ]
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.js$/,
        use: [{
          loader: 'string-replace-loader',
          options: {
            multiple: Object.entries(cfParams).map(([key, value]) => ({
              search: key,
              replace: value,
              flags: 'g'
            }))
          }
        }]
      }
    ]
  },
  devtool: 'source-map'
}
