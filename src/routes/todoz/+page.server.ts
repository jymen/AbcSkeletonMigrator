let count = 0;

export const load = async () => {
	console.log('load entered');
	// const form = await superValidate(data, schema);
	// const form = await superValidate(schema);
	//setError(form, 'name', 'E-name already exists.');

	// Unless you throw, always return { form } in load and form actions.
	return { form: { name: 'new name' } };
};

export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();

		// Server API:
		let newdata = {
			name: 'new name'
		};

		console.log('request entered');
		//const form = await superValidate(schema);

		// return { form };
	}
};
