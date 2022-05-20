import { Component } from "./base-component"
import { validate, Validatable } from "../util/validation"
import {AutoBind} from "../decorators/autobind"
import { projectState } from "../state/project-state"


    export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
