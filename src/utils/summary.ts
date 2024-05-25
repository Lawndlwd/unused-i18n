import { SummaryArgs, UnusedLocalesCountByPath } from '../types/types'
import createBox from './boxen'
import c from 'ansi-colors'

export const summary = ({
  unusedLocalesCountByPath,
  totalUnusedLocales,
}: SummaryArgs) => {
  unusedLocalesCountByPath.forEach(({ messages, warning }) => {
    console.log(createBox(messages ?? ''))
    if (warning) {
      console.log(createBox(warning ?? ''))
    }
  })

  console.log(
    createBox(`Total unused locales: ${c.yellow(`${totalUnusedLocales}`)}`)
  )
}
