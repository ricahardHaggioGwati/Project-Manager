//Drag & Drop
interface Dragable {
	dragStartHandler(event: DragEvent): void;
	dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
	dragOverHandler(event: DragEvent): void; // Permits drop
	dropHandler(event: DragEvent): void; // Reacts to drop
	dragLeaveHandler(event: DragEvent): void; // Visual feedback to user
}

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

	abstract configure(): void; //inheritated methods should be available
	abstract renderContent(): void;
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
		this.listeners.push(listenerFn);
	}
}

// State manager class
class ProjectState extends State<Project> {
	private projects: Project[] = [];
	//Singleton class
	private static instance: ProjectState;

	private constructor() {
		super();
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
		this.updateListeners()
	} 

	moveProgect(projId: string, newState: ProjectStatus) {
		const project = this.projects.find(pr => pr.id === projId)
		if (project && project.status !== newState) {
			project.status = newState
			this.updateListeners()
		}
	}

	private updateListeners() {
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

class ProjectItem
	extends Component<HTMLUListElement, HTMLLIElement>
	implements Dragable
{
	private project: Project;

	get people() {
		if (this.project.people === 1) {
			return '1 person ';
		}
		return `${this.project.people} people `;
	}

	constructor(hostId: string, project: Project) {
		super('single-project', hostId, false, project.id);
		this.project = project;

		this.configure();
		this.renderContent();
	}

	@AutoBind
	dragStartHandler(event: DragEvent): void {
		event.dataTransfer!.setData('text/plain', this.project.id);
		event.dataTransfer!.effectAllowed = 'move';
	}

	dragEndHandler(_: DragEvent) {
		console.log('DragEnd');
	}

	configure(): void {
		this.element.addEventListener('dragstart', this.dragStartHandler);
		this.element.addEventListener('dragend', this.dragEndHandler);
	}

	renderContent(): void {
		this.element.querySelector('h2')!.textContent = this.project.title;
		this.element.querySelector('h3')!.textContent = this.people + 'assigned';
		this.element.querySelector('p')!.textContent = this.project.description;
	}
}

// RenderList
class ProjectList
	extends Component<HTMLDivElement, HTMLElement>
	implements DragTarget
{
	assignedProjects: Project[];

	constructor(private type: 'active' | 'finished') {
		super('project-list', 'app', false, `${type}-projects`);
		this.assignedProjects = [];

		this.configure();
		this.renderContent();
	}

	@AutoBind
	dragOverHandler(event: DragEvent): void {
		if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
			event.preventDefault();
			const listEl = this.element.querySelector('ul')!;
			listEl.classList.add('droppable');
		}
	}

	@AutoBind
	dropHandler(event: DragEvent): void {
		const prjId = event.dataTransfer!.getData('text/plain');
		projectState.moveProgect(
			prjId,
			this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finsihed,
		);
	}

	@AutoBind
	dragLeaveHandler(_: DragEvent): void {
		const listEl = this.element.querySelector('ul')!;
		listEl.classList.remove('droppable');
	}

	configure(): void {
		this.element.addEventListener('dragover', this.dragOverHandler);
		this.element.addEventListener('dragleave', this.dragLeaveHandler);
		this.element.addEventListener('drop', this.dropHandler);

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
			new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
		}
	}
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
	titleInputElement: HTMLInputElement;
	discriptionInputElement: HTMLInputElement;
	peopleInputElement: HTMLInputElement;

	// acess the templet in the html and dispaly it
	constructor() {
		super('project-input', 'app', true, 'user-input');

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
