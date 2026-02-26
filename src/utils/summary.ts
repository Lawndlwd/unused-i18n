import { SummaryArgs } from '../types'

export const summary = ({
  unusedLocalesCountByPath,
  totalUnusedLocales,
}: SummaryArgs) => {
  for (const { messages } of unusedLocalesCountByPath) {
    console.log(messages ?? '')
  }

  console.log(`Total unused locales: \x1b[33m${totalUnusedLocales}\x1b[0m`)
}
