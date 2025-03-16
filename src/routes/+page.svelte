<script lang="ts">
  import ApplicationBar from "$src/components/ApplicationBar.svelte";
import DarkModeSwitcher from "$src/components/DarkModeSwitcher.svelte";


function buttonClicked() {
  alert('Button clicked');
} 

</script>

<ApplicationBar/>

<h1>Welcome to SvelteKit</h1>
<DarkModeSwitcher/>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<div class="flex items-center gap-4">
  <button type="button" class="my-2 btn preset-filled" onclick="{buttonClicked}">Button</button>

</div>