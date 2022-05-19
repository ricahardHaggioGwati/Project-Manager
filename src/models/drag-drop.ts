//Drag & Drop
export interface Dragable {
	dragStartHandler(event: DragEvent): void;
	dragEndHandler(event: DragEvent): void;
}

export interface DragTarget {
	dragOverHandler(event: DragEvent): void; // Permits drop
	dropHandler(event: DragEvent): void; // Reacts to drop
	dragLeaveHandler(event: DragEvent): void; // Visual feedback to user
}