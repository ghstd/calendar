const http = require('http');
const fs = require('fs');

const allUsersUrl = 'https://api.jsonbin.io/v3/b/63e15af7ebd26539d077b53f';

// Server
const server = http.createServer(async (request, response) => {

	function _setHeaders(response) {
		response.setHeader('Access-Control-Allow-Credentials', 'true')
		response.setHeader('Access-Control-Allow-Origin', request.headers.origin)
		response.setHeader('Access-Control-Allow-Headers', ['Content-Type', 'usecalendarkey'])
		response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST'])
		response.setHeader('Access-Control-Max-Age', 600)
	}

	function _parseCookie() {
		// return request.headers.cookie?.split(';').find(str => /useCalendarKey/.test(str))?.trim().split('=')[1];
		return request.headers.usecalendarkey
	}

	async function _getUrlFromDBByUserKey() {
		const userKey = _parseCookie();

		if (!userKey) return 'no userKey'

		async function _getDataFromDB() {
			const response = await fetch(allUsersUrl, {
				method: 'GET',
				headers: {
					'Content-type': 'application/json',
					'X-Master-Key': '$2b$10$xaWeFLridtnNorEUAg.CP.6TLeGmu/X/YlKoIIAUh1adEyot8T6ei'
				}
			});
			const data = await response.json();
			return data.record
		}

		const usersInDB = await _getDataFromDB();
		const name = Object.keys(usersInDB).find(name => usersInDB[name].key === userKey);

		return `https://api.jsonbin.io/v3/b/${usersInDB[name].url}`
	}

	// OPTIONS
	if (request.method === 'OPTIONS') {
		_setHeaders(response)
		response.end()
		return
	}

	// GET /checkLogin
	if (request.url === '/checkLogin') {
		const userKey = _parseCookie();

		if (!userKey) {
			_setHeaders(response)
			response.setHeader('Content-Type', 'text/plain')
			response.end('no login')
			return
		} else {
			_setHeaders(response)
			response.setHeader('Content-Type', 'text/plain')
			response.end('has login')
			return
		}
	}

	// POST /login
	if (request.url === '/login' && request.method === 'POST') {
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
					const response = await fetch(allUsersUrl, {
						method: 'GET',
						headers: {
							'Content-type': 'application/json',
							'X-Master-Key': '$2b$10$xaWeFLridtnNorEUAg.CP.6TLeGmu/X/YlKoIIAUh1adEyot8T6ei'
						}
					});
					const data = await response.json();
					return data.record
				}

				const usersInDB = await _getDataFromDB();
				const inputData = JSON.parse(Buffer.concat(body).toString());

				// signin
				if (inputData.type === 'signin') {
					const user = Object.keys(usersInDB).find(userName => userName === inputData.name);
					if (!user) {
						_setHeaders(response)
						response.setHeader('Content-Type', 'text/plain')
						response.end('no name')
						return
					}

					const correctPassword = usersInDB[user].password === inputData.password;
					if (!correctPassword) {
						_setHeaders(response)
						response.setHeader('Content-Type', 'text/plain')
						response.end('no password')
						return
					}

					_setHeaders(response)
					response.setHeader('Content-Type', 'text/plain')
					response.setHeader('usecalendarkey', `${usersInDB[user].key}`)
					response.setHeader('Access-Control-Expose-Headers', ['usecalendarkey'])
					response.setHeader('Set-Cookie', [`useCalendarKey=${usersInDB[user].key};Max-Age=259200;Secure;HttpOnly`])
					response.end('success login')
				}

				// signup
				if (inputData.type === 'signup') {
					if (!inputData.name) {
						_setHeaders(response)
						response.setHeader('Content-Type', 'text/plain')
						response.end('no name')
						return
					}

					if (!inputData.password) {
						_setHeaders(response)
						response.setHeader('Content-Type', 'text/plain')
						response.end('no password')
						return
					}

					const name = Object.keys(usersInDB).find(name => name === inputData.name);

					if (name) {
						_setHeaders(response)
						response.setHeader('Content-Type', 'text/plain')
						response.end('no name')
						return
					}

					const date = new Date();
					const calendarBasicData = [
						{
							"year": date.getFullYear(),
							"months": [
								{
									"month": date.getMonth(),
									"days": [
										{
											"day": date.getDate(),
											"notes": []
										}
									]
								}
							]
						}
					];

					async function _createNewUserInDB(value) {
						const response = await fetch('https://api.jsonbin.io/v3/b', {
							method: 'POST',
							headers: {
								'Content-type': 'application/json',
								'X-Master-Key': '$2b$10$xaWeFLridtnNorEUAg.CP.6TLeGmu/X/YlKoIIAUh1adEyot8T6ei',
								'X-Bin-Name': inputData.name
							},
							body: JSON.stringify(value)
						});
						const data = await response.json();
						return data.metadata.id
					}
					const newUserUrl = await _createNewUserInDB(calendarBasicData);

					function _randomKey() {
						const str = '1234567890abcdefghjklmnopqrstvwxyz';
						const arr = [];
						for (let i = 0; i < 10; i++) {
							arr.push(str[Math.floor(Math.random() * str.length)])
						}
						return arr.join('')
					}
					const newUserKey = _randomKey();

					usersInDB[inputData.name] = {
						password: inputData.password,
						key: newUserKey,
						url: newUserUrl
					}

					function _putDataInDB(value) {
						fetch(allUsersUrl, {
							method: 'PUT',
							headers: {
								'Content-type': 'application/json',
								'X-Master-Key': '$2b$10$xaWeFLridtnNorEUAg.CP.6TLeGmu/X/YlKoIIAUh1adEyot8T6ei'
							},
							body: JSON.stringify(value)
						})
					}
					_putDataInDB(usersInDB)

					_setHeaders(response)
					response.setHeader('Content-Type', 'text/plain')
					response.setHeader('usecalendarkey', `${newUserKey}`)
					response.setHeader('Access-Control-Expose-Headers', ['usecalendarkey'])
					response.setHeader('Set-Cookie', [`useCalendarKey=${newUserKey};Max-Age=259200;Secure;HttpOnly`])
					response.end('success login')
				}
			})
	}

	// GET /importantNotes
	if (request.url === '/importantNotes') {
		const url = await _getUrlFromDBByUserKey();

		if (url === 'no userKey') {
			_setHeaders(response)
			response.end(JSON.stringify({ status: 'no userKey' }))
			return
		}

		async function _getDataFromDB(url) {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-type': 'application/json',
					'X-Master-Key': '$2b$10$xaWeFLridtnNorEUAg.CP.6TLeGmu/X/YlKoIIAUh1adEyot8T6ei'
				}
			});
			const data = await response.json();
			return data.record
		}

		const serverData = await _getDataFromDB(url);
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

		_setHeaders(response)
		response.end(JSON.stringify(importantNotes))
		return
	}

	// GET /weekTasks
	if (request.url === '/weekTasks') {
		const url = await _getUrlFromDBByUserKey();

		if (url === 'no userKey') {
			_setHeaders(response)
			response.end(JSON.stringify({ status: 'no userKey' }))
			return
		}

		async function _getDataFromDB(url) {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-type': 'application/json',
					'X-Master-Key': '$2b$10$xaWeFLridtnNorEUAg.CP.6TLeGmu/X/YlKoIIAUh1adEyot8T6ei'
				}
			});
			const data = await response.json();
			return data.record
		}

		const serverData = await _getDataFromDB(url);
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

		_setHeaders(response)
		response.end(JSON.stringify(weekTasks))
		return
	}

	// GET /notes
	if (/notes/.test(request.url) && request.method === 'GET') {
		const url = await _getUrlFromDBByUserKey();

		if (url === 'no userKey') {
			_setHeaders(response)
			response.end(JSON.stringify({ status: 'no userKey' }))
			return
		}

		async function _getDataFromDB(url) {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-type': 'application/json',
					'X-Master-Key': '$2b$10$xaWeFLridtnNorEUAg.CP.6TLeGmu/X/YlKoIIAUh1adEyot8T6ei'
				}
			});
			const data = await response.json();
			return data.record
		}

		const serverData = await _getDataFromDB(url);
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

		_setHeaders(response)
		response.end(JSON.stringify(outputData))
		return
	}

	// POST /notes
	if (/notes/.test(request.url) && request.method === 'POST') {

		const body = [];

		request
			.on('error', (err) => {
				console.error(err);
			})
			.on('data', (chunk) => {
				body.push(chunk);
			})
			.on('end', async () => {
				const url = await _getUrlFromDBByUserKey();

				if (url === 'no userKey') {
					_setHeaders(response)
					response.end(JSON.stringify({ status: 'no userKey' }))
					return
				}

				async function _getDataFromDB(url) {
					const response = await fetch(url, {
						method: 'GET',
						headers: {
							'Content-type': 'application/json',
							'X-Master-Key': '$2b$10$xaWeFLridtnNorEUAg.CP.6TLeGmu/X/YlKoIIAUh1adEyot8T6ei'
						}
					});
					const data = await response.json();
					return data.record
				}

				const serverData = await _getDataFromDB(url);
				const inputData = JSON.parse(Buffer.concat(body).toString());
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

				_setHeaders(response)
				response.end()
				return
			})
	}
});

server.listen(10000, () => console.log('start'))



















