<!--
  Score tree component
-->
<script lang="ts">
	import { Pagination } from '@skeletonlabs/skeleton-svelte';

	import { AbcFolder, AbcFile, DbOperation, ABCDbCandidate } from '$src/data/ABCData';
	import AbcScoreLine from './AbcScoreLine.svelte';
	import { AbcPagerElement, FileFolderCard } from '$src/data/AbcDataDisplay';
	import { abcStore } from '$src/store';
	import Icon from '@iconify/svelte';

	let { dbOperation } = $props();
	let { currentRoot } = abcStore;

	let rootVisible = false;

	enum LocalActionsType {
		Add,
		Delete,
		Find
	}

	let sourceData: AbcPagerElement[] = $state([]);
	let page = $state(1);
	let size = $state(3);
	const slicedSource = $derived((s: AbcPagerElement[]) => s.slice((page - 1) * size, page * size));

	class AbcPager {
		private r: AbcFolder;
		display: Array<AbcPagerElement>;

		constructor(root: AbcFolder) {
			console.log(`root is : ${root.infos.title}`);
			this.r = root;
			this.display = [];
			this.r.folders.forEach((value, index) => {
				this.display.push(new AbcPagerElement(value));
			});
			this.r.files.forEach((value, index) => {
				this.display.push(new AbcPagerElement(value));
			});
			console.log(`display length is : ${this.display.length}`);
			sourceData = this.display;
		}

		public get root() {
			return this.r;
		}

		getPagerElement(index: number): AbcPagerElement {
			if (index == 0) {
				return new AbcPagerElement(this.root, true);
			}
			// non root case
			return this.display[index - 1];
		}

		public get hasParent() {
			if (this.r == undefined) return undefined;
			if (this.r.parent == undefined) return undefined;
			return this.r.parent!;
		}

		public get childrenLength() {
			if (this.r == undefined) return 0;
			return this.r.childrenLength;
		}

		/*
		getSlice(): AbcPagerElement[] {
			//let curPos = paginationSettings.page * paginationSettings.limit;
			// Build slice ignoring root parent folder if any
			return this.display.slice((page - 1) * size, page * size);
		}
		*/

		same(e1: AbcFile | AbcFolder, e2: AbcFile | AbcFolder): boolean {
			if (e1.oid && e2.oid) {
				if (e1.oid == e2.oid) return true;
			} else {
				if (e1.infos.title == e2.infos.title) return true;
			}
			return false;
		}

		find(
			candidate: AbcFile | AbcFolder,
			action: LocalActionsType = LocalActionsType.Find,
			newElement?: AbcFile | AbcFolder
		): AbcFile | AbcFolder | undefined {
			if (this.r == undefined) return undefined;
			let curPos = this.r!;
			// look for candidate
			if (candidate instanceof AbcFile) {
				let fi = candidate as AbcFile;
				for (let i = 0; i < curPos.files.length; i++) {
					let element = curPos.files[i];
					if (this.same(fi, element)) {
						switch (action) {
							case LocalActionsType.Add:
								curPos.files.splice(i + 1, 0, newElement! as AbcFile);
								break;
							case LocalActionsType.Delete:
								curPos.files.splice(i, 1);
								break;
							case LocalActionsType.Find:
								break;
						}
						return element;
					}
				}
			} else {
				// Folder assumed
				let fo = candidate as AbcFolder;
				for (let i = 0; i < curPos.folders.length; i++) {
					let element = curPos.folders[i];
					if (this.same(fo, element)) {
						switch (action) {
							case LocalActionsType.Add:
								curPos.folders.splice(i + 1, 0, newElement! as AbcFolder);
								break;
							case LocalActionsType.Delete:
								curPos.folders.splice(i, 1);
								break;
							case LocalActionsType.Find:
								break;
						}
						return element;
					}
				}
			}
			return undefined;
		}

		delete(candidate: AbcFile | AbcFolder) {
			// look for candidate
			this.find(candidate, LocalActionsType.Delete);
			$currentRoot = this.r!; // force ui update
		}

		add(event) {
			let insertionPoint: AbcFile | AbcFolder = event.detail.parent;
			let candidate: AbcFile | AbcFolder = event.detail.e;
			this.find(insertionPoint, LocalActionsType.Add, candidate);
			$currentRoot = this.r!; // force ui update
		}
	}

	let pager: AbcPager = $state(new AbcPager($currentRoot));

	/*
	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: maxPagesInit,
		size: 0,
		amounts: [1, 2, 5, 10]
	})
		*/

	$effect(() => {
		pager = new AbcPager($currentRoot);
	});

	$effect(() => {});

	class LocalActions {
		/*
		private parentCleanup(candidate: AbcFile | AbcFolder): AbcFile | AbcFolder {
			if (candidate.parent) {
				candidate.pOid = candidate.parent!.oid;
				candidate.parent = undefined; //prevent JSON circular reference
			}
			if (candidate instanceof AbcFolder) {
				// cleanup depandencies when updationg to avoid JSON recursivity error
				let fo = candidate as AbcFolder;
				fo.files = [];
				fo.folders = [];
			}
			return candidate;
		}
			*/

		addInTree(event) {
			console.log('adding in tree');
			pager.add(event);
			const candidate = event.detail.e;
			dbOperation({
				operation: DbOperation.ADD,
				candidate: candidate
			});
		}

		deleteInTree(event) {
			console.log('delete in tree');
			pager.delete(event.detail.e);
			const candidate = event.detail.e;
			dbOperation({
				operation: DbOperation.DELETE,
				candidate: candidate
			});
		}

		updateInTree(event) {
			console.log('update in tree');
			const candidate = event.detail.e;
			const media = event.detail.media;
			dbOperation({
				operation: DbOperation.UPDATE,
				candidate: candidate,
				media: media,
				files: event.detail.files
			});
		}
	}

	function computeIndex(index: number): number {
		if (rootVisible) return index + 1;
		return index;
	}

	const actions = new LocalActions();
</script>

<div class="space-y-8">
	<section class="w-full base-font-color space-y-2">
		{#if pager.hasParent != undefined}
			<AbcScoreLine
				card={new FileFolderCard(pager.getPagerElement(0), 0, true)}
				on:add-element={(event) => actions.addInTree(event)}
				on:delete-element={(event) => actions.deleteInTree(event)}
				on:updated-element={(event) => actions.updateInTree(event)}
			></AbcScoreLine>
		{/if}
		{#each slicedSource(sourceData) as pe, i}
			<ul class="list">
				<li>
					<AbcScoreLine
						card={new FileFolderCard(pe, computeIndex(i))}
						on:add-element={(event) => actions.addInTree(event)}
						on:delete-element={(event) => actions.deleteInTree(event)}
						on:updated-element={(event) => actions.updateInTree(event)}
						on:media-action={(event) => actions.updateInTree(event)}
					/>
				</li>
			</ul>
		{/each}
	</section>
	<div class="py-2">
		<Pagination
			data={sourceData}
			{page}
			onPageChange={(e) => (page = e.page)}
			pageSize={size}
			onPageSizeChange={(e) => (size = e.pageSize)}
			siblingCount={4}
		>
			{#snippet labelEllipsis()}<Icon
					icon="lucide:ellipsis"
					width="1.25em"
					height="1.25em"
				/>{/snippet}
			{#snippet labelNext()}<Icon
					icon="formkit:arrowright"
					width="1.25em"
					height="1.25em"
				/>{/snippet}
			{#snippet labelPrevious()}<Icon
					icon="formkit:arrowleft"
					width="1.25em"
					height="1.25em"
				/>{/snippet}
			{#snippet labelFirst()}<Icon
					icon="lucide:chevron-first"
					width="1.25em"
					height="1.25em"
				/>{/snippet}
			{#snippet labelLast()}<Icon
					icon="lucide:chevron-last"
					width="1.25em"
					height="1.25em"
				/>{/snippet}
		</Pagination>
	</div>
</div>
