
// ignore :: Number -> Number
let x = 10 + 20;

//  transformMe :: Integer -> Integer
let transformMe = def("transformMe", {}, [$.Integer, $.Integer], x => x + 5);

// ignore this too
const foo = function (a, b) {
  return a(b);
};