/* eslint-env browser */
const { isElement } = require('lodash');

function isJQuery(obj) {
  return obj && (obj.constructor.name === 'jQuery' || obj.constructor.prototype.jquery);
}

function isCollection(obj) {
  return obj && (obj.constructor.name === 'HTMLCollection' || obj.constructor.name === 'NodeList');
}

function isHtml(subject) {
  return isElement(subject) || isJQuery(subject) || isCollection(subject) ||
    (Array.isArray(subject) && subject.length && isElement(subject[0]));
}

function getSubject(testSubject) {
  if (isHtml(testSubject)) {
    let result = '';
    Cypress.$(testSubject).each(function () {
      result += this.outerHTML;
    });
    return result;
  }
  return testSubject;
}

module.exports = {
  isHtml,
  getSubject
};
