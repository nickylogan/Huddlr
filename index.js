require('@babel/register')({
    presets: ['@babel/preset-env']
})

module.exports = require('./src/server/index.js');