import cliBoxes from 'cli-boxes'
import stringWidth from 'string-width'

function createBox(
  content: string,
  boxType: keyof typeof cliBoxes = 'single'
): string {
  const box = cliBoxes[boxType]
  const lines = content.split('\n')
  const width = Math.max(...lines.map((line) => stringWidth(line)))
  const top = box.topLeft + box.top.repeat(width) + box.topRight
  const bottom = box.bottomLeft + box.bottom.repeat(width) + box.bottomRight
  const middle = lines
    .map(
      (line) =>
        box.left + line + ' '.repeat(width - stringWidth(line)) + box.right
    )
    .join('\n')
  return `${top}\n${middle}\n${bottom}`
}

export default createBox
