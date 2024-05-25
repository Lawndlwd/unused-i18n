import { SummaryArgs } from '../types/types'
import c from 'ansi-colors'

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

  console.log(`Total unused locales: ${c.yellow(`${totalUnusedLocales}`)}`)
}
