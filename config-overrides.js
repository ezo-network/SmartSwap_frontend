const webpack = require('webpack');
const {
  useBabelRc,
  removeModuleScopePlugin,
  override,
  addWebpackPlugin 
} = require("customize-cra");
module.exports = override(useBabelRc(), removeModuleScopePlugin());