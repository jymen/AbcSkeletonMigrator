<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import AbcCheckBox from './AbcCheckBox.svelte';
	import { AbcFolder, AbcFile } from '$data/ABCData';

	const dispatch = createEventDispatcher();
	let isDirectory: boolean = false;

	export let textSize = '';
	export let name = '';
	export let parent: AbcFile | AbcFolder;

	function textChanged(event) {
		name = event.target.value;
	}

	function setDirectory(event) {
		isDirectory = !isDirectory;
	}

	function addElement() {
		console.log('adding element to tree on :', parent.infos.title);
		if (name.length > 0) {
			dispatch('add-element', {
				name: name,
				parent: parent,
				isDirectory: isDirectory
			});
		}
	}

	function importElement() {
		console.log('import element into tree on :', parent.infos.title);
	}
</script>

<div class="w-68">
	<AbcCheckBox
		label="Directory :"
		checked={isDirectory}
		on:isDirectory={setDirectory}
		eventName="isDirectory"
	/>
	<div class="flex flex-cols items-center">
		<div class="flex flex-row m-2">
			<label class="flex pr-2 items-center justify-center" for="checkboxDefault"> Name:</label>
			<input
				on:input={textChanged}
				type="text"
				class="input {textSize} px-2"
				name="custom-input-name"
				bind:value={name}
			/>
		</div>
	</div>
	<div class="grid grid-cols-2 justify-items-center m-4">
		<button on:click={addElement} type="button" class="btn preset-filled">New</button>
		<button on:click={addElement} type="button" class="btn preset-filled">Import</button>
	</div>
</div>
