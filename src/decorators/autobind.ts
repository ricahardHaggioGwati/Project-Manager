export function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
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
