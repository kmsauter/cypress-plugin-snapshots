const rimraf = require('rimraf').sync;

function initTestTasks(on) {
	on('task', {
		'testing:deleteFiles': (files) => {
			rimraf(files);
			return true;
		}
	});
}

module.exports = {
	initTestTasks
}
