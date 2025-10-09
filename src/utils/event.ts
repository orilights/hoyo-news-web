import mitt from 'mitt'

// eslint-disable-next-line ts/consistent-type-definitions
type Events = {
  scrollByDate: string
}

export const event = mitt<Events>()
