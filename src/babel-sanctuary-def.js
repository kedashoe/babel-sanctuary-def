var $ = require('sanctuary-def');
var HMP = require('hindley-milner-parser-js');

var map = function map(f, before) {
  var after = new Array(before.length);
  for (var i = 0; i < before.length; ++i) {
    after[i] = f(before[i]);
  }
  return after;
};

var objToList = function objToList(f, obj) {
  var list = [];
  for (var k in obj) {
    list.push(f(k, obj[k]));
  }
  return list;
};

var isNullaryType = function isNullaryType(type) {
  return type.children.length === 0;
};

var isSanctuaryDefType = function isSanctuaryDefType(type) {
  var text = type.text;
  return text in $ || text === 'Maybe' || text === 'Either';
};

// global to help us generate nodes without having to pass `t` around everywhere
var Gen;

function genInit(t, opts) {
  return {
    id: function(x) {
      return t.identifier(x);
    },
    
    defExpression: function(impl, sig) {
      return t.callExpression(
        Gen.id('def'),
        [
          Gen.name(sig.name),
          Gen.constraints(sig.constraints),
          Gen.types(sig.types),
          impl
        ]
      );
    },
    
    name: function(name) {
      return t.stringLiteral(name + (opts.smileys ? ':)' : ''));
    },
    
    constraints: function(constraints) {
      return t.objectExpression(objToList(Gen.constraint, constraints));
    },
    
    constraint: function(typevar, typeClasses) {
      return t.objectProperty(
        Gen.id(typevar),
        t.arrayExpression(map(Gen.id, typeClasses))
      );
    },
    
    functionType: function(types) {
      return t.memberExpression(Gen.id('$'), Gen.id('Function'));
    },

    sanctuaryDefTypeNode: function(type) {
      return t.memberExpression(Gen.id('$'), Gen.id(type.text));
    },

    userTypeNode: function(type) {
      return Gen.id(type.text);
    },

    typeNode: function(type) {
      return (
        isSanctuaryDefType(type) ? Gen.sanctuaryDefTypeNode(type) :
                                   Gen.userTypeNode(type)
      );
    },

    nullaryType: function(type) {
      return Gen.typeNode(type);
    },

    parameterizedType: function(type) {
       return t.callExpression(
        Gen.typeNode(type), 
        map(Gen.type, type.children)
      );
    },

    typeType: function(type) {
      return (
        isNullaryType(type) ? Gen.nullaryType(type) :
                              Gen.parameterizedType(type)
      );
    },

    typevarType: function(text) {
      return Gen.id(text);
    },

    type: function(type) {
      return (
        type.type === 'function' ? Gen.functionType(type.children) :
        type.type === 'type'     ? Gen.typeType(type) :
                                   Gen.typevarType(type.text)
      );
    },

    types: function(types) {
      return t.arrayExpression(map(Gen.type, types));
    },

    isFunctionExpression(node) {
      return t.isFunction(node) && t.isExpression(node);
    },
  };
};

// starting from top of comments block
// check for line that looks vaguely like a HM signature
var parseCommentsSignature = function parseCommentsSignature(comments) {
  for (var i = 0; i < comments.length; ++i) {
    var comment = comments[i].value;
    var matches = comment.match(/([\w\$]+\s+::.*?)\s*$/);
    if (matches != null) {
      return HMP.parse(matches[1]);
    }
  }
  return null;
};
  
var parseComments = function parseComments(comments) {
  return comments == null ? null : parseCommentsSignature(comments);
};

module.exports = function(babel) {
  return {
    visitor: {

      Program: {
        enter: function(path, state) {
          Gen = genInit(babel.types, state.opts);
        },
      },

      VariableDeclarator: {
        enter: function(path, state) {
          var signature = parseComments(path.parent.leadingComments);
          if (signature !== null && Gen.isFunctionExpression(path.node.init)) {
            path.node.init = Gen.defExpression(path.node.init, signature)
          }
        },
      },
  
      ObjectProperty: {
        enter: function(path, state) {
          var signature = parseComments(path.node.leadingComments);
          if (signature !== null && Gen.isFunctionExpression(path.node.value)) {
            path.node.value = Gen.defExpression(path.node.value, signature)
          }
        },
      },
 
      AssignmentExpression: {
        enter: function(path, state) {
          var signature = parseComments(path.parent.leadingComments);
          if (signature !== null && Gen.isFunctionExpression(path.node.right)) {
            path.node.right = Gen.defExpression(path.node.right, signature)
          }
        },
      },
    }
  };
};

