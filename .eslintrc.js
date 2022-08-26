module.exports = {
    extends: [
      'react-app', // for editor
      'eslint:recommended',
      'plugin:prettier/recommended',
      'prettier'
    ],
    parser: 'babel-eslint',
    plugins: ['babel'],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off", 
      'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
      'no-console':  'off',
      'babel/no-unused-expressions': 'off',
      'no-unused-expressions': 'off',
      'no-empty': "off",
      'no-prototype-builtins': "off",
      'prettier/prettier': [
        'off',
        {
          
        },
      ],
    },
  }