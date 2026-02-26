import { Command } from 'commander'
import { processTranslations } from './index'

const program = new Command()

program
  .command('display')
  .description('Display missing translations')
  .option('--srcPath <path>', 'Source path to search for translations')
  .option('--localPath <path>', 'Local path to the translation files')
  .action(async (options) => {
    const paths =
      options.srcPath && options.localPath
        ? [{ srcPath: [options.srcPath], localPath: options.localPath }]
        : undefined
    const count = await processTranslations({ paths, action: 'display' })
    if (count > 0) process.exit(1)
  })

program
  .command('remove')
  .description('Remove unused translations')
  .option('--srcPath <path>', 'Source path to search for translations')
  .option('--localPath <path>', 'Local path to the translation files')
  .action(async (options) => {
    const paths =
      options.srcPath && options.localPath
        ? [{ srcPath: [options.srcPath], localPath: options.localPath }]
        : undefined
    await processTranslations({ paths, action: 'remove' })
  })

program.parse(process.argv)
