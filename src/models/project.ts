namespace App {
    // storing different states
	export enum ProjectStatus {
		Active,
		Finsihed,
	}

	// Custom project type
	export class Project {
		constructor(
			public id: string,
			public title: string,
			public description: string,
			public people: number,
			public status: ProjectStatus,
		) {}
	}
}