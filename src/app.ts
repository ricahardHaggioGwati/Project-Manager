///<reference path="componets/project-input.ts"/>
///<reference path="componets/project-list.ts"/>

//Base class
namespace App {
	new ProjectInput();
	new ProjectList('active');
	new ProjectList('finished');
}
