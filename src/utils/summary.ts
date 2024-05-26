import { SummaryArgs } from '../types/types'

export const summary = ({
  unusedLocalesCountByPath,
  totalUnusedLocales,
}: SummaryArgs) => {
  unusedLocalesCountByPath.forEach(({ messages, warning }) => {
    console.log(messages ?? '')
    if (warning) {
      console.log(warning ?? '')
    }
  })

  console.log(`Total unused locales: \x1b[33m${totalUnusedLocales}\x1b[0m`)
}
