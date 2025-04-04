<script lang="ts">
	import AbcInstrumentsList from './AbcInstrumentsList.svelte';
	import AbcCounter from './AbcCounter.svelte';
	import { abcStore, AbcScoreData } from '$src/store';
	import { type Tablature } from 'abcjs';
	import { onMount } from 'svelte';

	let { scoreContext, tablatureChanged } = abcStore;
	let { oid } = $props();
	let context: AbcScoreData = $state($scoreContext.getContext(oid));
	let tablatureChecked: boolean = $state(context.tablatureChecked);

	/*
	$effect(() => {
		console.log('AbcTablaturePanel effect tablatureChecked:', tablatureChecked);
		context.tablatureChecked = tablatureChecked;
		tablatureChange();
	});
  */

	onMount(() => {
		console.log(`AbcTablaturePanel mounted `);
	});

	const instrumentsData: Tablature[] = [
		{ instrument: 'violin', label: 'Violin', capo: 0 },
		{ instrument: 'guitar', label: 'Guitar (%T)', capo: 0 },
		{
			instrument: 'guitar',
			label: 'Guitar (%T)',
			capo: 0,
			tuning: ['D,', 'A,', 'D', 'G', 'A', 'd']
		}
	];

	let capo: number = $state(0);
	let instrument: number = $state(0);

	function notifyChange(checked: boolean) {
		let newContext = instrumentsData[instrument];
		newContext.capo = capo;
		$scoreContext.updateContext(oid, checked, newContext);
		$tablatureChanged++;
	}

	function tablatureChange() {
		console.log('tablatureChange :', tablatureChecked);
		notifyChange(tablatureChecked);
	}

	function instrumentChanged(instrumentNumber: number) {
		if (instrumentNumber === instrument) return; // Not Changed
		instrument = instrumentNumber;
		console.log('instrumentOut tablature:', tablatureChecked);
		tablatureChange();
	}
</script>

<div class="w-68">
	<div class="py-2 flex flex-row">
		<label class="px-1 inline-block ps-[0.15rem] hover:cursor-pointer" for="checkboxDefault">
			Tablature :
		</label>
		<div class="items-center px-2">
			<div class="mb-[0.125rem] block min-h-[1.5rem] ps-[1.5rem]">
				<input
					class="relative float-left -ms-[1.5rem] me-[6px] mt-[0.15rem] h-[1.125rem] w-[1.125rem] text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
					type="checkbox"
					bind:checked={tablatureChecked}
					onchange={tablatureChange}
				/>
			</div>
		</div>
	</div>
	<AbcInstrumentsList instrumentOut={instrumentChanged} />
	<div class="py-2">
		<label class="px-1 inline-block ps-[0.15rem] hover:cursor-pointer" for="checkboxDefault">
			capo :
		</label>
	</div>
	<AbcCounter
		on:counter-changed={(event) => {
			capo = event.detail.counter;
		}}
	/>
</div>
