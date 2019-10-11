const { isElement } = require('lodash');

/* HTML */
function isHtml(subject) {
  if (subject === undefined || subject === null) {
    return false;
  }
  return isElement(subject) ||
    subject.constructor.name === 'jQuery' || subject.constructor.prototype.jquery ||
    subject.constructor.name === 'HTMLCollection' || subject.constructor.name === 'NodeList' ||
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

/* JSON */
function formatJson(subject) {
  return JSON.stringify(subject, undefined, 2);
}

// Alphabetically sort keys in JSON
function normalizeObject(subject) {
  if (Array.isArray(subject)) {
    return subject.map(normalizeObject);
  }

  if (typeof subject === 'object' && subject !== null) {
    const keys = Object.keys(subject);
    keys.sort();

    return keys.reduce((result, key) => {
      result[key] = normalizeObject(subject[key]);
      return result;
    }, {});
  }

  return subject;
}

function removeExcludedFields(subject, excludedFields) {
  if (excludedFields && Array.isArray(excludedFields)) {
    if (Array.isArray(subject)) {
      return subject.map(item => removeExcludedFields(item, excludedFields));
    }

    if (typeof subject === 'object' && subject !== null) {
      return Object.keys(subject)
        .filter(key => excludedFields.indexOf(key) === -1)
        .reduce((result, key) => {
          result[key] = removeExcludedFields(subject[key], excludedFields);
          return result;
        }, {});
    }
  }

  return subject;
}

module.exports = {
  isHtml,
  getSubject,
  formatJson,
  normalizeObject,
  removeExcludedFields
};
