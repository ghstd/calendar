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
	const text = document.createElement('div');

	recordsListItem.classList.add('records__item')
	text.classList.add('records__text')

	text.contentEditable = 'true'

	const timeForm = createRecordsTimeElement(recordsListItem);
	recordsListItem.append(text)
	recordsList.prepend(recordsListItem)

	// text.onfocus = () => {
	// 	console.log('focus')
	// }

	// text.onblur = () => {
	// 	console.log('blur')
	// }

	timeForm.firstElementChild.focus()
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
	mousedownElementIsHalfAnHour: null,
	mouseupElementIsHalfAnHour: null,
	getMousedownElement(element, halfAnHour = false) {
		this.mousedownElement = element
		this.mousedownElementIsHalfAnHour = halfAnHour
	},
	getMouseupElement(element, halfAnHour = false) {
		this.mouseupElement = element
		this.mouseupElementIsHalfAnHour = halfAnHour

		this.compareElements()
	},
	compareElements() {
		if (this.mousedownElement === this.mouseupElement) {
			if (this.mousedownElementIsHalfAnHour) {
				const timeValue = this.mousedownElement.previousElementSibling.innerText.split(':')[0].trim() + ':30';
				console.log(timeValue)
			} else {
				const timeValue = this.mousedownElement.innerText.replace(/\s/g, '');
				console.log(timeValue)
			}
		} else {
			if (this.mousedownElementIsHalfAnHour) {
				const timeValue = this.mousedownElement.previousElementSibling.innerText.split(':')[0].trim() + ':30';
				console.log(timeValue)
			} else {
				const timeValue = this.mousedownElement.innerText.replace(/\s/g, '');
				console.log(timeValue)
			}

			if (this.mouseupElementIsHalfAnHour) {
				const timeValue = this.mouseupElement.previousElementSibling.innerText.split(':')[0].trim() + ':30';
				console.log(timeValue)
			} else {
				const timeValue = this.mouseupElement.innerText.replace(/\s/g, '');
				console.log(timeValue)
			}
		}
	}
};



scale.addEventListener('mouseup', () => {
	scale.querySelectorAll('.hover').forEach(el => el.classList.remove('hover'))
})

scale.addEventListener('mouseleave', () => {
	scale.querySelectorAll('.hover').forEach(el => el.classList.remove('hover'))
})

scale.querySelectorAll('.scale__hour').forEach(el => {
	el.addEventListener('mouseenter', e => {
		if (e.buttons === 1 && e.target.classList.contains('hover')) {
			e.relatedTarget.classList.remove('hover')
		} else {
			e.target.classList.add('hover')
		}
	})

	el.addEventListener('mouseleave', e => {
		if (e.buttons === 0) {
			e.target.classList.remove('hover')
		}
	})

	el.addEventListener('mousedown', e => {
		bindMouseEvents.getMousedownElement(e.target)
	})

	el.addEventListener('mouseup', e => {
		bindMouseEvents.getMouseupElement(e.target)
	})
})

scale.querySelectorAll('.scale__lines').forEach(el => {
	el.addEventListener('mouseenter', e => {
		if (e.buttons === 1 && e.target.classList.contains('hover')) {
			e.relatedTarget.classList.remove('hover')
		} else {
			e.target.classList.add('hover')
		}
	})

	el.addEventListener('mouseleave', e => {
		if (e.buttons === 0) {
			e.target.classList.remove('hover')
		}
	})
	el.addEventListener('mousedown', e => {
		bindMouseEvents.getMousedownElement(e.target.closest('.scale__lines'), true)
	})

	el.addEventListener('mouseup', e => {
		bindMouseEvents.getMouseupElement(e.target.closest('.scale__lines'), true)
	})
})

function createRecordsTimeElement(rootElement) {

	const timeForm = document.createElement('form');

	timeForm.classList.add('records__time')
	timeForm.innerHTML = `
	<input class="records__time-input" type="text" maxlength="2">
	<input class="records__time-input" type="text" maxlength="2">
	<input class="records__time-input" type="text" maxlength="2">
	<input class="records__time-input" type="text" maxlength="2">
	<button class="records__time-submit" type="submit">add</button>
`
	rootElement.append(timeForm)

	const timeInput = timeForm.querySelectorAll('.records__time-input');
	const timeSubmit = timeForm.querySelectorAll('.records__time-submit');

	for (let i = 0; i < timeInput.length; i++) {
		timeInput[i].onkeydown = e => {

			if (e.code === 'ArrowRight') {
				const nextElementIndex = (i + 1) % timeInput.length;
				timeInput[nextElementIndex].focus()
			}

			if (e.code === 'ArrowLeft') {
				const prevElementIndex = ((i > 0) ? (i - 1) : timeInput.length - 1) % timeInput.length;
				timeInput[prevElementIndex].focus()
			}
		}
	}

	timeForm.onsubmit = e => {
		e.preventDefault()

		const showTimeElement = document.createElement('div');
		const showTimeValue = `from ${timeInput[0].value} : ${timeInput[1].value} to ${timeInput[2].value} : ${timeInput[3].value}`;

		showTimeElement.onclick = () => {
			timeForm.classList.remove('hidden')
			showTimeElement.remove()
			timeForm.firstElementChild.focus()
		}

		showTimeElement.classList.add('records__time-label')
		showTimeElement.textContent = showTimeValue
		timeForm.classList.add('hidden')

		rootElement.prepend(showTimeElement)
		rootElement.lastElementChild.focus()
	}

	return timeForm
}




