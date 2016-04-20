var FS = require('fs');
var Path = require('path');

var Tape = require('tape');
var Babel = require('babel-core');
var BSD = require('../src/babel-sanctuary-def.js');

var getAllTestFiles = function getAllTestFiles() {
  var path = __dirname + '/before';
  return FS.readdirSync(path).map(function(filename) {
    return Path.join(path, filename);
  });
};

var runTestFile = function runTestFile(path) {
  var basename = Path.basename(path);
  Tape.test('transforms ' + basename, function(t) {
    var actual = Babel.transformFileSync(path, { plugins: [BSD, {}]});
    var expectedPath = path.replace(/^(.*?\/)before(\/[^/]+\.js)$/, '$1expected$2');
    t.equal(actual.code.toString(), FS.readFileSync(expectedPath).toString());
    t.end();
  });
};

var paths = process.argv.length > 2 ? process.argv.slice(2) : getAllTestFiles();
paths.map(runTestFile);

