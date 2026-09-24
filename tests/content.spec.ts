import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('book scaffold', () => {
  it('declares the public title and all ten chapter routes', () => {
    const configPath = 'docs/.vitepress/config.mts'

    expect(existsSync(configPath)).toBe(true)

    const config = readFileSync(configPath, 'utf8')
    expect(config).toContain('别只会和 AI 聊天')

    for (let chapter = 1; chapter <= 10; chapter += 1) {
      expect(config).toContain(`/chapters/${String(chapter).padStart(2, '0')}-`)
    }
  })
})
