const { Diff2Html } = require('diff2html');
const { Base64 } = require('js-base64');
const diff2HtmlTemplate = require('./diff2html-templates');
const { URL_PREFIX, TASK_UPDATE_SNAPSHOT } = require('../constants');
const { CONFIG_KEY } = require('../config');

const { $ } = Cypress;
const diffFormat = Cypress.env(CONFIG_KEY.diffFormat) || 'side-by-side';

function Modal(data, win, target) {
  this.max = false;
  this.win = win;

  const that = this;
  let diffHtml;

  if (data.isImage) {
    formatImageResult(data).then(function (diffHtml) { /* eslint-disable-line no-shadow */
      diffHtml = diff2HtmlTemplate(data, `<div style="position: relative;">${diffHtml}</div>`);
      that.show(data, diffHtml, target);
    });
  } else {
    diffHtml = Diff2Html.getPrettyHtml(data.diff, {
      inputFormat: 'diff',
      outputFormat: data.passed || data.updated ? 'line-by-line' : diffFormat,
      synchronisedScroll: true
    });
    this.show(data, diffHtml, target);
  }
}

Modal.prototype.show = function (data, diffHtml, target) {
  const {
    commandName,
    updated,
    passed,
    isImage
  } = data;

  // Modal
  const modal = $(diffHtml)
    .addClass(commandName)
    .addClass(`state-${updated ? 'updated' : passed ? 'passed' : 'failed'}`) /* eslint-disable-line no-nested-ternary */
    .appendTo(this.win);

  // Header
  const header = modal.find('.d2h-file-name-wrapper');
  header.find('.d2h-tag').text('').removeClass('d2h-changed-tag');

  const buttonsRight = $('<div class="btn-group-right" style="margin-left:auto;"></div>').appendTo(header);

  // Background blend mode
  if (isImage && !passed && !updated) {
    $('<select><option>difference</option><option>screen</option><option>overlay</option></select>')
      .change(function () {
        modal.find('.snapshot-image--diff .snapshot-image__wrapper')
          .css('background-blend-mode', $(this).val());
      })
      .val(Cypress.env(CONFIG_KEY).backgroundBlend).prop('selected', true)
      .appendTo(buttonsRight);
  }

  // Update snapshot button
  if (!passed && !updated) {
    $('<button class="snapshot-btn-approve"><i class="fa fa-check"></i> Update snapshot</button>')
      .on('click', function () {
        Cypress.backend('task', {
          task: TASK_UPDATE_SNAPSHOT,
          arg: data,
          timeout: 5000
        }).then(function (updatedData) {
          $(target).text('Snapshot').addClass('command-state-updated')
            .attr('href', `${URL_PREFIX}${Base64.encode(JSON.stringify(updatedData))}`);

          closeSnapshotModal();
        });
      })
      .appendTo(buttonsRight);
  }

  const btnGroup1 = $('<div class="btn-group"/>').appendTo(buttonsRight);

  // Maximize button
  const that = this;
  $('<button class="snapshot-btn-max"><i class="fa fa-expand"></i></button>')
    .on('click', function () {
      if (that.max) {
        modal.css({ 'height': 'unset', 'width': 'unset' });
      } else {
        modal.css({ 'height': '100vh', 'width': '100vw' });
      }
      that.max = !that.max;
    }).appendTo(btnGroup1);

  // Close button
  $('<button class="snapshot-btn-close"><i class="fa fa-close"></i></button>')
    .on('click', closeSnapshotModal).appendTo(btnGroup1);
};

function closeSnapshotModal() {
  $(window.parent.window.document).find('.d2h-wrapper').remove();
};


function getImageDataUri(filePath) {
  return Cypress.backend('read:file', filePath, { encoding: 'base64' })
    .then(function (result) {
      return `data:image/png;base64,${result.contents}`;
    }).catch(function (err) {
      console.log(err);
      return false;
    });
}

function formatImageResult(data) {

  const title = data.snapshotTitle;

  if (data.passed || data.updated) {
    return getImageDataUri(data.expected.path)
      .then((dataUri) =>
        wrapImage('single', title, dataUri, `max-height: ${data.expected.height}px;max-width: ${data.expected.width}px;`)
      ); /* eslint-disable-line function-paren-newline */
  }

  const imageHeight = data.diff ? data.diff.height : Math.max(data.actual.height, data.expected.height);
  const imageWidth = data.diff ? data.diff.width : Math.max(data.actual.width, data.expected.width);
  const imageRatio = Math.round(imageHeight / imageWidth * 10000) / 100;
  const imageStyle = `padding-top: ${imageRatio}%;max-height: ${imageHeight}px;max-width: ${imageWidth}px;`;

  const promises = [
    getImageDataUri(data.expected.path),
    getImageDataUri(data.actual.path)
  ];

  if (data.diff) {
    promises.push(getImageDataUri(data.diff.path));
  }

  return Cypress.Promise.all(promises)
    .then(([ expectedImage, actualImage, diffImage = '' ]) => {
      return (
        wrapImage('Expected', title, expectedImage, imageStyle) +
        wrapImage('Actual', title, actualImage, imageStyle) +
        (diffImage ? createImageDiff(title, expectedImage, diffImage, imageStyle) : '')
      );
    });
}

function createImageDiff(title, expectedImage, diffImage, imageStyle) {
  // Overlay expected and diff image on top of each other
  const diffStyle = `${imageStyle} background: 
    url(${expectedImage}) top left no-repeat, 
    url(${diffImage}) top left no-repeat; 
    background-size: 100% auto, 100% auto;`;

  return wrapImage('diff', title, '', diffStyle);
}

function wrapImageStyle(imageStyle, image = '') {
  if (imageStyle) {
    return `<div class="snapshot-image__wrapper" style="${imageStyle}">${image || ''}</div>`;
  }
  return image;
}

function wrapImage(imageTitle, title, dataUri = '', imageStyle = '') {
  return `<div class="snapshot-image snapshot-image--${imageTitle.toLowerCase()}">
				<h2 class="snapshot-image__title">${imageTitle} result</h2>
				${wrapImageStyle(
    imageStyle,
    dataUri ? `<img src="${dataUri}" alt="${title}" class="snapshot-image__image">` : ''
  )}
			</div>`;
}

module.exports = Modal;
