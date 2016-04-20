
// var
//  a :: Number -> Number
var a = def('a', {}, [$.Number, $.Number], x => x + 1);

// let
//  b :: Number -> Number
let b = def('b', {}, [$.Number, $.Number], x => x + 1);

// const
//    c :: Number -> Number
const c = def('c', {}, [$.Number, $.Number], x => x + 1);

// member
var d = {
  // d :: Number -> Number
  d: def('d', {}, [$.Number, $.Number], x => x + 1),
  e: 'hello'
};

var f = {};
// f :: Number -> Number
f.f = def('f', {}, [$.Number, $.Number], x => x + 1);