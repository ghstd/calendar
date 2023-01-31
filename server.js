const http = require('http');
const fs = require('fs');

const server = http.createServer(async (request, response) => {

	// OPTIONS
	if (request.method === 'OPTIONS') {
		response.setHeader('Access-Control-Allow-Origin', '*')
		response.setHeader('Access-Control-Allow-Methods', '*')
		response.setHeader('Access-Control-Allow-Headers', '*')
		response.setHeader('Access-Control-Max-Age', 2592000)
		response.end()
		return
	}

	// GET /importantNotes
	if (request.url === '/importantNotes') {
		async function _getDataFromDB() {
			const response = await fetch('https://api.jsonbin.io/v3/b/63d81542ebd26539d06f4b54', {
				method: 'GET',
				headers: {
					'Content-type': 'application/json',
					'X-Master-Key': '$2b$10$xaWeFLridtnNorEUAg.CP.6TLeGmu/X/YlKoIIAUh1adEyot8T6ei'
				}
			});
			const data = await response.json();
			return data.record
		}

		const serverData = await _getDataFromDB();
		const importantNotes = [];

		serverData.forEach(year => {
			year.months.forEach(month => {
				month.days.forEach(day => {
					day.notes.forEach(note => {
						if (note.important) {
							const result = {
								year: year.year,
								month: month.month,
								day: day.day,
								text: note.text
							};
							importantNotes.push(result)
						}
					})
				})
			})
		})

		response.setHeader('Access-Control-Allow-Origin', '*')
		response.setHeader('Access-Control-Allow-Methods', '*')
		response.setHeader('Access-Control-Allow-Headers', '*')
		response.setHeader('Access-Control-Max-Age', 2592000)
		response.end(JSON.stringify(importantNotes))
		return
	}

	// GET /weekTasks
	if (request.url === '/weekTasks') {
		async function _getDataFromDB() {
			const response = await fetch('https://api.jsonbin.io/v3/b/63d81542ebd26539d06f4b54', {
				method: 'GET',
				headers: {
					'Content-type': 'application/json',
					'X-Master-Key': '$2b$10$xaWeFLridtnNorEUAg.CP.6TLeGmu/X/YlKoIIAUh1adEyot8T6ei'
				}
			});
			const data = await response.json();
			return data.record
		}

		const serverData = await _getDataFromDB();
		const date = new Date();
		const firstWeekday = date.getDate() - ((date.getDay() === 0 ? 7 : date.getDay()) - 1);
		date.setDate(firstWeekday)

		const weekTasks = [];

		for (let i = 0; i < 7; i++) {
			const year = serverData.find(item => item.year === date.getFullYear());
			const month = year ? year.months.find(item => item.month === date.getMonth()) : null;
			const day = month ? month.days.find(item => item.day === date.getDate()) : null;

			if (!day || !day.notes.length) {
				weekTasks.push(0)
			} else {
				weekTasks.push(day.notes.length)
			}

			date.setDate(date.getDate() + 1)
		}

		response.setHeader('Access-Control-Allow-Origin', '*')
		response.setHeader('Access-Control-Allow-Methods', '*')
		response.setHeader('Access-Control-Allow-Headers', '*')
		response.setHeader('Access-Control-Max-Age', 2592000)
		response.end(JSON.stringify(weekTasks))
		return
	}

	// GET /notes
	if (/notes/.test(request.url) && request.method === 'GET') {
		async function _getDataFromDB() {
			const response = await fetch('https://api.jsonbin.io/v3/b/63d81542ebd26539d06f4b54', {
				method: 'GET',
				headers: {
					'Content-type': 'application/json',
					'X-Master-Key': '$2b$10$xaWeFLridtnNorEUAg.CP.6TLeGmu/X/YlKoIIAUh1adEyot8T6ei'
				}
			});
			const data = await response.json();
			return data.record
		}

		const serverData = await _getDataFromDB();
		const urlParams = new URL(request.url, `http://${request.headers.host}`).searchParams;
		const inputParams = {};
		for (const [key, value] of urlParams) {
			inputParams[key] = parseInt(value)
		}

		function _checkingSavedData() {
			const year = serverData.find(item => item.year === inputParams.year);

			if (!year) {
				serverData.push({
					year: inputParams.year,
					months: [
						{
							month: inputParams.month,
							days: [
								{
									day: inputParams.day,
									notes: []
								}
							]
						}
					]
				})
			} else {
				const month = year.months.find(item => item.month === inputParams.month);

				if (!month) {
					year.months.push({
						month: inputParams.month,
						days: [
							{
								day: inputParams.day,
								notes: []
							}
						]
					})
				} else {
					const day = month.days.find(item => item.day === inputParams.day);

					if (!day) {
						month.days.push({
							day: inputParams.day,
							notes: []
						})
					}
				}
			}
		}
		_checkingSavedData()

		const outputData = serverData
			.find(item => item.year === inputParams.year)
			.months
			.find(item => item.month === inputParams.month)
			.days
			.find(item => item.day === inputParams.day);

		response.setHeader('Access-Control-Allow-Origin', '*')
		response.setHeader('Access-Control-Allow-Methods', '*')
		response.setHeader('Access-Control-Allow-Headers', '*')
		response.setHeader('Access-Control-Max-Age', 2592000)
		response.end(JSON.stringify(outputData))
		return
	}

	// POST
	if (request.method === 'POST') {

		const body = [];

		request
			.on('error', (err) => {
				console.error(err);
			})
			.on('data', (chunk) => {
				body.push(chunk);
			})
			.on('end', async () => {
				async function _getDataFromDB() {
					const response = await fetch('https://api.jsonbin.io/v3/b/63d81542ebd26539d06f4b54', {
						method: 'GET',
						headers: {
							'Content-type': 'application/json',
							'X-Master-Key': '$2b$10$xaWeFLridtnNorEUAg.CP.6TLeGmu/X/YlKoIIAUh1adEyot8T6ei'
						}
					});
					const data = await response.json();
					return data.record
				}

				const serverData = await _getDataFromDB();
				const inputData = JSON.parse(body.toString());
				const urlParams = new URL(request.url, `http://${request.headers.host}`).searchParams;
				const inputParams = {};
				for (const [key, value] of urlParams) {
					inputParams[key] = parseInt(value)
				}

				function _checkingSavedData() {
					const year = serverData.find(item => item.year === inputParams.year);

					if (!year) {
						serverData.push({
							year: inputParams.year,
							months: [
								{
									month: inputParams.month,
									days: [
										{
											day: inputParams.day,
											notes: []
										}
									]
								}
							]
						})
					} else {
						const month = year.months.find(item => item.month === inputParams.month);

						if (!month) {
							year.months.push({
								month: inputParams.month,
								days: [
									{
										day: inputParams.day,
										notes: []
									}
								]
							})
						} else {
							const day = month.days.find(item => item.day === inputParams.day);

							if (!day) {
								month.days.push({
									day: inputParams.day,
									notes: []
								})
							}
						}
					}
				}
				_checkingSavedData()

				const targetData = serverData
					.find(item => item.year === inputParams.year)
					.months
					.find(item => item.month === inputParams.month)
					.days
					.find(item => item.day === inputParams.day);

				targetData.notes = inputData.notes

				function _deleteEmptyItems() {
					const year = serverData.find(item => item.year === inputParams.year);
					const month = year.months.find(item => item.month === inputParams.month);
					const day = month.days.find(item => item.day === inputParams.day);

					const emptyNotes = [];
					day.notes.forEach(note => {
						if (note.timeStart === '' && note.timeEnd === '' && note.text === '') {
							emptyNotes.push(note)
						}
					})
					for (let i = 0; i < emptyNotes.length; i++) {
						day.notes.splice(day.notes.findIndex(note => note === emptyNotes[i]), 1)
					}
					if (!day.notes.length) {
						month.days.splice(month.days.findIndex(item => item === day), 1)
					}
					if (!month.days.length) {
						year.months.splice(year.months.findIndex(item => item === month), 1)
					}
				}
				_deleteEmptyItems()

				function _putDataInDB(value) {
					fetch('https://api.jsonbin.io/v3/b/63d81542ebd26539d06f4b54', {
						method: 'PUT',
						headers: {
							'Content-type': 'application/json',
							'X-Master-Key': '$2b$10$xaWeFLridtnNorEUAg.CP.6TLeGmu/X/YlKoIIAUh1adEyot8T6ei'
						},
						body: JSON.stringify(value)
					})
				}
				_putDataInDB(serverData)

				response.setHeader('Access-Control-Allow-Origin', '*')
				response.setHeader('Access-Control-Allow-Methods', '*')
				response.setHeader('Access-Control-Allow-Headers', '*')
				response.setHeader('Access-Control-Max-Age', 2592000)
				response.end()
				return
			})
	}
});

server.listen(10000, () => console.log('start'))



















