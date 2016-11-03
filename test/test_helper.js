const lambda = require('../index');
const original = Object.assign({}, lambda);

lambda.stub = function(key, fn) {
    this[key] = fn.bind(this)
};

lambda.unstub = function(key) {
    if(key) this[key] = original[key].bind(this)
    else Object.assign(this, original);
};

module.exports = lambda;
