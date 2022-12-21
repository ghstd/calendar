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


// Test =============================================================

const form = document.querySelector('.records__form');
const addRecordButton = document.querySelector('.controls__add-record');
const recordsList = document.querySelector('.records__list');

form.onsubmit = e => {
	e.preventDefault()
	console.log('form is submit!!!')
}

addRecordButton.addEventListener('click', () => {
	const recordsListItem = document.createElement('li');
	const text = document.createElement('p');
	const textarea = document.createElement('textarea');

	recordsListItem.classList.add('records__item')
	text.classList.add('records__text', 'hidden')
	textarea.classList.add('records__textarea', 'show')

	recordsListItem.append(text)
	recordsListItem.append(textarea)
	recordsList.append(recordsListItem)

	text.onclick = () => {
		text.classList.add('hidden')
		textarea.classList.add('show')
		textarea.focus()
	}

	textarea.onblur = () => {
		if (textarea.value === '') {
			recordsListItem.remove()
		}
		text.innerText = textarea.value
		text.classList.remove('hidden')
		textarea.classList.remove('show')
		form.requestSubmit()
	}

	textarea.focus()
})


























