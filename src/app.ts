// State manager class
class ProjectState {
	private listeners: any[] = [];
	private projects: any[] = [];
	//Singleton class
	private static instance: ProjectState;

	private constructor() {}

	static getInstance() {
		if (this.instance) {
			return this.instance;
		}
		this.instance = new ProjectState();
		return this.instance;
	}

	addProjects(title: string, discription: string, numberOfPeople: number) {
		const newProjects = {
			id: Math.random(), // not a scalable solution
			title: title,
			discription: discription,
			people: numberOfPeople,
		};

		this.projects.push(newProjects);
		for (const listenerFn of this.listeners) {
			listenerFn(this.projects.slice()); // pass a copy of projects
		}
	}

	addListener(listenerFn: Function) {
		this.listeners.push(listenerFn);
	}
}

//Creating aglobal instance of ProjectState
const projectState = ProjectState.getInstance();

//Validate
interface Validatable {
	value: string | number;
	required?: boolean; //alt required: boolean | undefined
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
}

// validation
function validate(validatableInput: Validatable) {
	let isValid = true;
	if (validatableInput.required) {
		isValid = isValid && validatableInput.value.toString().trim().length !== 0;
	}
	if (
		validatableInput.minLength != null &&
		typeof validatableInput.value === 'string'
	) {
		isValid =
			isValid && validatableInput.value.length >= validatableInput.minLength;
	}
	if (
		validatableInput.maxLength != null &&
		typeof validatableInput.value === 'string'
	) {
		isValid =
			isValid && validatableInput.value.length <= validatableInput.maxLength;
	}
	if (
		validatableInput.min != null &&
		typeof validatableInput.value === 'number'
	) {
		isValid = isValid && validatableInput.value >= validatableInput.min;
	}
	if (
		validatableInput.max != null &&
		typeof validatableInput.value === 'number'
	) {
		isValid = isValid && validatableInput.value <= validatableInput.max;
	}
	return isValid;
}

function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
	const originalMethod = descriptor.value;
	const adjustedDescriptor: PropertyDescriptor = {
		configurable: true,
		enumerable: false,
		get() {
			const boundFn = originalMethod.bind(this); // this will refer to whatever is responsible for trggering the get method
			return boundFn;
		},
	};
	return adjustedDescriptor;
}

// RenderList
class ProjectList {
	templetElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLElement;
	assignedProjects: any[];

	constructor(private type: 'active' | 'finished') {
		this.templetElement = document.getElementById(
			'project-list',
		)! as HTMLTemplateElement;
		this.hostElement = document.getElementById('app')! as HTMLDivElement;
		this.assignedProjects = [];

		//fetching document fragements from templetElemt, with all levels of nesting
		const importedNode = document.importNode(this.templetElement.content, true);
		this.element = importedNode.firstElementChild as HTMLElement;
		this.element.id = `${this.type}-projects`;

		projectState.addListener((projects: any[]) => {
			this.assignedProjects = projects;
			this.renderProjects();
		});
		this.attach();
		this.renderContent();
	}

	private renderProjects() {
		const listEl = document.getElementById(
			`${this.type}-projects-list`,
		)! as HTMLUListElement;
		for (const prjItem of this.assignedProjects) {
			const listItem = document.createElement('li');
			listItem.textContent = prjItem.title;
			listEl.appendChild(listItem);
		}
	}

	private renderContent() {
		const listId = `${this.type}-projects-list`;
		this.element.querySelector('ul')!.id = listId;
		this.element.querySelector('h2')!.textContent =
			this.type.toUpperCase() + ' PROJECTS';
	}

	private attach() {
		this.hostElement.insertAdjacentElement('beforeend', this.element);
	}
}

class ProjectInput {
	templetElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLElement;
	titleInputElement: HTMLInputElement;
	discriptionInputElement: HTMLInputElement;
	peopleInputElement: HTMLInputElement;

	// acess the templet in the html and dispaly it
	constructor() {
		this.templetElement = document.getElementById(
			'project-input',
		)! as HTMLTemplateElement;
		this.hostElement = document.getElementById('app')! as HTMLDivElement;

		//fetching document fragements from templetElemt, with all levels of nesting
		const importedNode = document.importNode(this.templetElement.content, true);
		this.element = importedNode.firstElementChild as HTMLFormElement;
		this.element.id = 'user-input';

		this.titleInputElement = this.element.querySelector(
			'#title',
		)! as HTMLInputElement;
		this.discriptionInputElement = this.element.querySelector(
			'#description',
		)! as HTMLInputElement;
		this.peopleInputElement = this.element.querySelector(
			'#people',
		)! as HTMLInputElement;

		this.configure();
		this.attach();
	}

	private gatherUserInput(): [string, string, number] | void {
		const enteredTitle = this.titleInputElement.value;
		const entereDiscription = this.discriptionInputElement.value;
		const enteredPeople = this.peopleInputElement.value;

		const titleValidatable: Validatable = {
			value: enteredTitle,
			required: true,
		};

		const discValidatable: Validatable = {
			value: entereDiscription,
			required: true,
			minLength: 5,
		};

		const peopleValidatable: Validatable = {
			value: +enteredPeople,
			required: true,
			min: 1,
			max: 5,
		};

		if (
			!validate(titleValidatable) ||
			!validate(discValidatable) ||
			!validate(peopleValidatable)
		) {
			alert('Invalid Input');
			return;
		} else {
			return [enteredTitle, entereDiscription, +enteredPeople];
		}
	}

	private clearInput() {
		this.titleInputElement.value = '';
		this.discriptionInputElement.value = '';
		this.peopleInputElement.value = '';
	}

	private submitHandler(event: Event) {
		event.preventDefault();
		const userInput = this.gatherUserInput();
		if (Array.isArray(userInput)) {
			const [title, desc, people] = userInput;
			projectState.addProjects(title, desc, people);
			this.clearInput();
		}
	}

	@AutoBind
	private configure() {
		this.element.addEventListener('submit', this.submitHandler.bind(this));
	}

	//Rendering
	private attach() {
		this.hostElement.insertAdjacentElement('afterbegin', this.element);
	}
}

const projInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
