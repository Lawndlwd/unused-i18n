import { describe, it, expect, vi, afterEach } from 'vitest'
import { analyze } from '../../src/lib/analyze'
import * as fs from 'fs'
vi.mock('fs')

const fileContent = `
const scopedT = namespaceTranslation('namespace')
  {keyLabel ?? scopedT('labelKey1')}
  {keyLabel ? scopedT('labelKey2') : scopedT('labelKey3')}
  {scopedT(keyLabel ? 'labelKey4' : 'labelKey5')}
  {scopedT(\`labelKey6.\${variable}\`)}
  {scopedT(variable0)}
  {scopedT(\`\${variable1}.\${variable2}\`)}


  {t(\`\${variable3}.\${variable4}\`)}
  {keyLabel ?? t('labelKey8')}
  {keyLabel ? t('labelKey9') : t('labelKey10')}
  {t(\`labelKey11.\${variable5}\`)}
  {t(\`labelKey12.\${variable6}\`)}
  toast.success(t('account.user.modal.edit.changeEmail'));
  { [FORM_ERROR]: t('form.errors.formErrorNoRetry') };


  {scopedTOne('labelKey13', {
      name: scopedT('labelKey14')
  })}
`

const expected = [
  'account.user.modal.edit.changeEmail',
  'form.errors.formErrorNoRetry',
  'labelKey10',
  'labelKey11.**',
  'labelKey12.**',
  'labelKey8',
  'labelKey9',
  '**.**',

  'namespace.**',
  'namespace.**.**',
  'namespace.labelKey1',
  'namespace.labelKey13',
  'namespace.labelKey14',
  'namespace.labelKey2',
  'namespace.labelKey3',
  'namespace.labelKey4',
  'namespace.labelKey5',
  'namespace.labelKey6.**',
]

vi.mocked(fs.readFileSync).mockReturnValue(fileContent)

describe('analyze', () => {
  it('should extract all translations correctly from the file', () => {
    const result = analyze({
      filePath: 'path/to/test/file.js',
      scopedNames: ['scopedT', 'scopedTOne'],
    })

    expect(result).toEqual(expect.arrayContaining(expected))
    expect(expected).toEqual(expect.arrayContaining(result))
  })
})
