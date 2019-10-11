const dataRaw = {
  other: {
    'undefined': undefined,
    'null': null,
    'false': false,
    'true': true
  },
  json: {
    'string': 'kylie',
    'number': 5,
    'date': new Date(2019, 1, 11),
    'array': [1, 2, 3],
    'object': {
      a: 1,
      b: 2
    },
    'object-2': {
      a: 1,
      b: 2,
      c: function () {
        console.log('test');
      }
    },
    'template': `Line 1
		Line2
		Line3`
  },
  html: {
    'jquery-get': '',
    'jquery-create': Cypress.$('<div>Created DIV</div>'),
    'cy-get-element': '',
    'DOM-exists': '',
    'DOM-created': '',
    'HTMLCollection': '',
    'NodeList': '',
    'svg': ''
  }
};

const dataFormatted = {
  other: {
    'undefined': 'undefined',
    'null': 'null',
    'false': 'false',
    'true': 'true'
  },
  json: {
    'string': dataRaw.json.string,
    'number': '5',
    'date': '2019-02-11T05:00:00.000Z',
    'array': '[\n  1,\n  2,\n  3\n]',
    'object': '{\n  "a": 1,\n  "b": 2\n}',
    'object-2': '{ \n  "a": 1, \n  "b": 2\n  "c": fn() \n }', // todo
    'template': `Line 1
		Line2
		Line3`
  },
  html: {
    'jquery-get': '<h4>H1</h4>\n<h4>H2</h4>\n<h4>H3</h4>',
    'jquery-create': '<div>Created DIV</div>',
    'cy-get-element': '<h4>H1</h4>\n<h4>H2</h4>\n<h4>H3</h4>',
    'DOM-exists': '<div id="test-div">Test Div</div>',
    'DOM-created': '<div>DOM-created</div>',
    'HTMLCollection': '<h4>H1</h4>\n<h4>H2</h4>\n<h4>H3</h4>',
    'NodeList': '<h4>H1</h4>\n<h4>H2</h4>\n<h4>H3</h4>',
    'svg': '<svg height="20" width="40"><path d="M10 0 L0 20 L20 20 Z"></path></svg>'
  }
};

let document, win;
before(function () {
  cy.visit('/static/stub3.html');
  cy.window().then((win2) => {
    win = win2;
    document = win2.document;

    dataRaw.html['jquery-get'] = Cypress.$(win.document).find('h4');
    dataRaw.html['DOM-exists'] = document.getElementById('test-div');
    dataRaw.html['HTMLCollection'] = document.getElementsByTagName('h4');
    dataRaw.html['NodeList'] = document.querySelectorAll("h4");
    dataRaw.html['svg'] = Cypress.$(win.document).find('svg');

    dataRaw.html['DOM-created'] = document.createElement("div");
    var node = document.createTextNode("DOM-created");
    dataRaw.html['DOM-created'].appendChild(node);

    cy.get('h4').then(function ($el) {
      dataRaw.html['cy-get-element'] = $el;
    });
  });
});

function runSuite(suiteName, cb, skip) {
  describe(suiteName, function () {
    Object.keys(dataRaw[suiteName]).forEach(function (item) {
      if (skip && skip.includes(item)) {
        it.skip(item, function () { });
      } else {
        it(item, function () {
          cb(dataRaw[suiteName][item], item, suiteName);
        });
      } 
    });
  });
}

function runSuites(testName, cb, skip) {
  describe(testName, function () {
    Object.keys(dataRaw).forEach(function (suiteName) {
      runSuite(suiteName, cb, skip);
    });
  });
}

module.exports = {
  runSuites,
  dataRaw,
  dataFormatted
}
