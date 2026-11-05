/** Shared shape for the unlisted "forms" page (served at /connect/). */

export type FormButton = {
  label: string
  /** External form URL (e.g. a Google Form link). */
  url: string
}

export type CommunityFormsPage = {
  /** Page is public. Off = visiting the URL shows a not-found page. */
  enabled: boolean
  title: string
  intro: string
  buttons: FormButton[]
}
