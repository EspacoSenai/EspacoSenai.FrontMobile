module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            'babel-preset-expo',
        ],
        plugins: [
            '@babel/plugin-proposal-export-namespace-from',
            [
                "module:react-native-dotenv",
                {
                    moduleName: "@env",
                    path: ".env",
                    blocklist: null,
                    allowlist: null,
                    safe: false,
                    allowUndefined: true,
                },
            ],
            // Plugin do Reanimated precisa ser o último para correta inicialização.
            'react-native-reanimated/plugin',
        ],

    };
}; 
