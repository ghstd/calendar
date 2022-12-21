const path = require('path');
const fs = require('fs');
const http = require('http');

const server = http.createServer((request, response) => {

	const timestampFromUrl = path.basename(request.url);

	fs.readFile(path.join(__dirname, 'data.json'), 'utf-8', (error, data) => {
		if (error) throw error

		const db = JSON.parse(data);
		const dateInArray = new Date(parseInt(timestampFromUrl)).toLocaleDateString().split('.');
		const year = dateInArray[2];
		const month = parseInt(dateInArray[1]) - 1;
		const day = parseInt(dateInArray[0]) - 1;
		const result = db[year]?.[month][day];

		if (result) {
			response.setHeader('Access-Control-Allow-Origin', '*')
			response.end(JSON.stringify(result))
		} else {
			console.log('empty in db')
		}

		// fs.writeFile(path.join(__dirname, 'data', `${timestampFromUrl}.json`), '', error => {
		// 	if (error) throw error

		// 	response.setHeader('Access-Control-Allow-Origin', '*')
		// 	response.end(JSON.stringify({
		// 		"date": parseInt(timestampFromUrl),
		// 		"records": []
		// 	}))
		// })
	})
})

server.listen(2000, () => console.log('start server'))




























