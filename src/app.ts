//Base class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
	templetElement: HTMLTemplateElement;
	hostElement: T;
	element: U;

	constructor(
		templetId: string,
		hostElementId: string,
		insertAtBegining: boolean,
		newElementId?: string,
	) {
		this.templetElement = document.getElementById(
			templetId,
		)! as HTMLTemplateElement;
		this.hostElement = document.getElementById(hostElementId)! as T;

		const importedNode = document.importNode(this.templetElement.content, true);
		this.element = importedNode.firstElementChild as U;
		if (newElementId) {
			this.element.id = newElementId;
		}

		this.attach(insertAtBegining);
	}

	private attach(insertAtBegining: boolean) {
		this.hostElement.insertAdjacentElement(
			insertAtBegining ? 'afterbegin' : 'beforeend',
			this.element,
		);
	}

	abstract configure(): void			//inheritated methods should be available
	abstract renderContent(): void
}

// storing different states
enum ProjectStatus {
	Active,
	Finsihed,
}

// Custom project type
class Project {
	constructor(
		public id: string,
		public title: string,
		public description: string,
		public people: number,
		public status: ProjectStatus,
	) {}
}

type Listener<T> = (items: T[]) => void;

class State<T> {
	protected listeners: Listener<T>[] = [];

	addListener(listenerFn: Listener<T>) {
		this.listeners.push(listenerFn)
	}
}

// State manager class
class ProjectState extends State<Project>{
	private projects: Project[] = [];
	//Singleton class
	private static instance: ProjectState;

	private constructor() {
		super()
	}

	static getInstance() {
		if (this.instance) {
			return this.instance;
		}
		this.instance = new ProjectState();
		return this.instance;
	}

	addProjects(title: string, discription: string, numberOfPeople: number) {
		const newProjects = new Project(
			Math.random().toString(),
			title,
			discription,
			numberOfPeople,
			ProjectStatus.Active,
		);

		this.projects.push(newProjects);
		for (const listenerFn of this.listeners) {
			listenerFn(this.projects.slice()); // pass a copy of projects
		}
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
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
	assignedProjects: Project[];

	constructor(private type: 'active' | 'finished') {
		super('project-list', 'app',false,`${type}-projects` )
		this.assignedProjects = [];

		this.configure()
		this.renderContent();
	}

	configure(): void {
		projectState.addListener((projects: Project[]) => {
			const relevantProjects = projects.filter((prj) => {
				if (this.type === 'active') {
					return prj.status === ProjectStatus.Active;
				}
				return prj.status === ProjectStatus.Finsihed;
			});
			this.assignedProjects = relevantProjects;
			this.renderProjects();
		});
	}
	
	renderContent() {
		const listId = `${this.type}-projects-list`;
		this.element.querySelector('ul')!.id = listId;
		this.element.querySelector('h2')!.textContent =
			this.type.toUpperCase() + ' PROJECTS';
	}

	private renderProjects() {
		const listEl = document.getElementById(
			`${this.type}-projects-list`,
		)! as HTMLUListElement;
		// Solve duplication error
		listEl.innerHTML = '';
		for (const prjItem of this.assignedProjects) {
			const listItem = document.createElement('li');
			listItem.textContent = prjItem.title;
			listEl.appendChild(listItem);
		}
	}


}

class ProjectInput extends Component<HTMLDivElement,HTMLFormElement >{
	titleInputElement: HTMLInputElement;
	discriptionInputElement: HTMLInputElement;
	peopleInputElement: HTMLInputElement;

	// acess the templet in the html and dispaly it
	constructor() {
		super('project-input','app', true, 'user-input')

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
	}

	configure() {
		this.element.addEventListener('submit', this.submitHandler);
	}

	renderContent() {}

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

	@AutoBind
	private submitHandler(event: Event) {
		event.preventDefault();
		const userInput = this.gatherUserInput();
		if (Array.isArray(userInput)) {
			const [title, desc, people] = userInput;
			projectState.addProjects(title, desc, people);
			this.clearInput();
		}
	}

}

const projInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
