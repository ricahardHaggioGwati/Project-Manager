 export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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

			const importedNode = document.importNode(
				this.templetElement.content,
				true,
			);
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