// metro.config.js

const { getDefaultConfig } = require("expo/metro-config");

// Aqui você pega a configuração padrão do Expo para o seu projeto.
const config = getDefaultConfig(__dirname);

// Aqui você faz a mágica acontecer!
// Adiciona o transformador para SVGs.
config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");

// E aqui você diz ao Metro para não tratar SVGs como assets.
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg");

// E, finalmente, diz para o Metro tratar SVGs como arquivos de código-fonte.
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

// Retorna a configuração modificada.
module.exports = config;