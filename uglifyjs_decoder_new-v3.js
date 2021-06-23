let fs = require('fs');
let UglifyJS = require('uglify-js')

var code = fs.readFileSync("decoder_new-v3.js", "utf8");


let options = {
    compress: {
        properties: {}
    },
    mangle: {
        toplevel: true,
        reserved: ['firstLongName', 'decodeUplink'],
        // properties: {
        //     debug: "",
        //     reserved: ['bytes', 'hardwareVersion']
        // }
    }
}

code = UglifyJS.minify(code, options).code;

console.log('==== Length: ' + code.length)
console.log(code);
