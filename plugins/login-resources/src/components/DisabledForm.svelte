<script lang="ts">
    import { loginAction, recoveryAction } from '../actions'
    import { BottomAction, getHref } from '..'
    import { Label, deviceOptionsStore as deviceInfo } from '@hcengineering/ui'
    import { NavLink } from '@hcengineering/presentation'

    export let bottomActions: BottomAction[] = [loginAction, recoveryAction]
</script>

<div class="container"
  style:padding={$deviceInfo.docWidth <= 480 ? '.25rem 1.25rem' : '4rem 5rem'}
  style:min-height={$deviceInfo.docHeight > 720 ? '42rem' : '0'}
>
<h3 style:color={'var(--theme-content-color)'} style:align-self={'center'}">This action is disabled, please connect with admin.</h3>
    {#if bottomActions.length}
    <div class="footer">
      {#each bottomActions as action}
        <div>
          <span><Label label={action.caption} /></span>
          {#if action.page}
            <NavLink href={getHref(action.page)}><Label label={action.i18n} /></NavLink>
          {:else}
            <a href="." on:click|preventDefault={action.func}><Label label={action.i18n} /></a>
          {/if}
        </div>
      {/each}
    </div>
    {/if}
</div>

<style lang="scss">
  .container {
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .title {
      font-weight: 500;
      font-size: 1.25rem;
      color: var(--theme-caption-color);
    }
    .caption a {
      padding-bottom: 0.375rem;
      border-bottom: 2px solid var(--theme-caption-color);

      &:not(.selected) {
        color: var(--theme-dark-color);
        border-bottom-color: transparent;

        &:hover {
          color: var(--theme-caption-color);
        }
      }
      &.selected {
        cursor: default;
      }
      &:first-child {
        margin-right: 1.75rem;
      }
      &:hover {
        text-decoration: none;
      }
    }
    .status {
      padding-top: 1rem;
      grid-column-start: 1;
      grid-column-end: 3;
    }

    .form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 0.75rem;
      row-gap: 1.5rem;
      margin-top: 1.5rem;

      .form-row {
        grid-column-start: 1;
        grid-column-end: 3;
      }

      .hint {
        margin-top: 1rem;
        font-size: 0.8rem;
        color: var(--theme-content-color);
      }

      .send {
        margin-top: 0rem;
      }
    }
    .grow-separator {
      flex-grow: 1;
    }
    .footer {
      margin-top: 1.75rem;
      font-size: 0.8rem;
      color: var(--theme-content-color);
      span {
        color: var(--theme-darker-color);
      }
      a {
        font-weight: 500;
        text-decoration: underline;
        color: var(--theme-content-color);
      }
    }
  }
</style>
