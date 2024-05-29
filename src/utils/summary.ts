import { SummaryArgs } from '../types'
import { exit } from 'process'

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
  if (unusedLocalesCountByPath.length > 1) {
    exit(1)
  }
}
