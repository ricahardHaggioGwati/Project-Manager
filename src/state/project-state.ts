import {ProjectStatus, Project} from '../models/project'

type Listener<T> = (items: T[]) => void;
    
    class State<T> {
		protected listeners: Listener<T>[] = [];

		addListener(listenerFn: Listener<T>) {
			this.listeners.push(listenerFn);
		}
    }
    
    export class ProjectState extends State<Project> {
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
			this.updateListeners();
		}

		moveProgect(projId: string, newState: ProjectStatus) {
			const project = this.projects.find((pr) => pr.id === projId);
			if (project && project.status !== newState) {
				project.status = newState;
				this.updateListeners();
			}
		}

		private updateListeners() {
			for (const listenerFn of this.listeners) {
				listenerFn(this.projects.slice()); // pass a copy of projects
			}
		}
	}

	//Creating aglobal instance of ProjectState
	export const projectState = ProjectState.getInstance();
