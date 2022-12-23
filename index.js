// Functions =============================================================

function markDateInCalendar(element, ancestor, activeSelector) {
	ancestor.querySelector(`.${activeSelector}`)?.classList.remove(`${activeSelector}`)
	element.classList.add(`${activeSelector}`)
}

function getTimestampFromCalendar(dayElement, monthElement, yearElement) {
	const day = parseInt(dayElement.innerText);
	const month = parseInt(monthElement.innerText.toLowerCase() === 'september' ? '8' : '0');
	const year = parseInt(yearElement.innerText);
	const timestamp = new Date(year, month, day).getTime();

	return timestamp
}

async function getDataFromServer(timestamp) {

	const response = await fetch(`http://127.0.0.1:2000/${timestamp}`);
	const data = await response.json();

	return data
}

function renderSchedule(date, data = [], scheduleElement, scheduleTitle) {
	scheduleTitle.innerText = new Date(date).toLocaleDateString()
	scheduleElement.insertAdjacentHTML('beforeend', data.map(item => `<p>${item}</p>`).join(''))
}

// Elements =============================================================

const calendarDays = document.querySelector('.calendar__days');
const year = document.querySelector('.calendar__year');
const month = document.querySelector('.calendar__month');
const schedule = document.querySelector('.schedule');
const scheduleTitle = schedule.querySelector('.schedule__title');

// Programme =============================================================

calendarDays.addEventListener('click', async e => {
	const target = e.target;

	if (target.classList.contains('calendar__num')) {
		markDateInCalendar(target, calendarDays, 'calendar__num_active')

		const timestamp = getTimestampFromCalendar(target, month, year);
		const savedData = await getDataFromServer(timestamp);

		if (savedData) {
			renderSchedule(savedData.date, savedData.records, schedule, scheduleTitle)
		} else {
			console.log('not yet any records')
		}
	}
})


// Test Records =============================================================

const form = document.querySelector('.records__form');
const addRecordButton = document.querySelector('.controls__add-record');
const recordsList = document.querySelector('.records__list');

form.onsubmit = e => {
	e.preventDefault()
	console.log('form is submit!!!')
}

addRecordButton.addEventListener('click', () => addNewRecord())

function addNewRecord(timeValue) {
	const recordsListItem = document.createElement('li');
	const time = document.createElement('input');
	const text = document.createElement('div');

	recordsListItem.classList.add('records__item')
	time.classList.add('records__time')
	text.classList.add('records__text')

	time.type = "time"
	text.contentEditable = 'true'

	if (timeValue) time.value = timeValue

	recordsListItem.append(time)
	recordsListItem.append(text)
	recordsList.prepend(recordsListItem)

	// text.onfocus = () => {
	// 	console.log('focus')
	// }

	// text.onblur = () => {
	// 	console.log('blur')
	// }

	// time.onblur = () => {
	// 	console.log(time.value)
	// }

	text.focus()
}

// Test Scale =============================================================

const scale = document.querySelector('.scale__body');

// scale.addEventListener('click', e => {

// 	if (e.target.classList.contains('scale__hour')) {
// 		const timeValue = e.target.textContent.replace(/\s/g, '');
// 		addNewRecord(timeValue)
// 		return
// 	}

// 	if (e.target.classList.contains('scale__lines')) {
// 		const timeValue = e.target.previousElementSibling.textContent
// 			.split(':')[0]
// 			.trim() + ':30';
// 		addNewRecord(timeValue)
// 		return
// 	}

// 	if (e.target.parentElement.classList.contains('scale__lines')) {
// 		const timeValue = e.target.parentElement.previousElementSibling.textContent
// 			.split(':')[0]
// 			.trim() + ':30';
// 		addNewRecord(timeValue)
// 		return
// 	}
// })

const bindMouseEvents = {
	mousedownElement: null,
	mouseupElement: null,
	mousedown(element) { this.mousedownElement = element },
	mouseup(element) { this.mouseupElement = element },
	compareElements() {
		if (this.mousedownElement === this.mouseupElement) {
			console.log('same element')
		} else {
			console.log(this.mousedownElement, this.mouseupElement)
		}
	}
};

scale.addEventListener('mousedown', e => {
	if (e.target.classList.contains('scale__hour')) {
		console.log(e.target)
		console.log(e.target.textContent.replace(/\s/g, ''))
		bindMouseEvents.mousedown(e.target)
	}
	if (e.target.classList.contains('scale__lines')) {
		console.log(e.target)
		console.log(e.target.previousElementSibling.textContent.replace(/\s/g, ''), ' :30')
		bindMouseEvents.mousedown(e.target)
	}
	if (e.target.parentElement.classList.contains('scale__lines')) {
		console.log(e.target)
		console.log(e.target.parentElement.previousElementSibling.textContent.replace(/\s/g, ''), ' :30')
		bindMouseEvents.mousedown(e.target)
	}
})

scale.addEventListener('mouseup', e => {
	console.log(e.target);
	bindMouseEvents.mouseup(e.target)
	bindMouseEvents.compareElements()
})


















