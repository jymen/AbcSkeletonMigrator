<script lang="ts">
  import { abcStore } from '$src/store';
  import { Switch } from '@skeletonlabs/skeleton-svelte';

  let { darkMode } = abcStore;
  let st : boolean = $state($darkMode)


  function toggleDarkMode(checked: boolean) {
    if (checked) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    st = checked;
    $darkMode = checked;
  } 

</script>

<Switch name="dark-switcher" checked={st} onCheckedChange={(e) => toggleDarkMode(e.checked) } />