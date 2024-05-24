import { describe, it, expect, vi } from 'vitest'
import { extractTranslations } from '../../../src/core/extract'
import * as fs from 'fs'

vi.mock('fs')

describe('extractTranslations', () => {
  it('should extract all translations correctly from the file', () => {
    const fileContent = `
    const scopedT = namespaceTranslation('namespace')
      toast.success(t('account.user.modal.edit.changeEmail'));
      { [FORM_ERROR]: t('form.errors.formErrorNoRetry') };
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
      {scopedTOne('labelKey13', {
          name: scopedT('labelKey14')
      })}
    `

    // Mock file system read operation
    // @ts-expect-error mockReturnValue not availble
    fs.readFileSync.mockReturnValue(fileContent)

    const expected = [
      'account.user.modal.edit.changeEmail',
      'form.errors.formErrorNoRetry',
      'labelKey10',
      'labelKey11.**',
      'labelKey12.**',
      'labelKey8',
      'labelKey9',
      'namespace.**',
      '**.**',
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
    const result = extractTranslations('path/to/test/file.js', [
      'scopedT',
      'scopedTOne',
    ])

    expect(result).toEqual(expect.arrayContaining(expected))
    expect(expected).toEqual(expect.arrayContaining(result))
  })
})
