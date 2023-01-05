import { useEffect, useState } from 'react'
import Clipboard from 'clipboard'
import { useRouter } from 'next/router'
import type { Gitmoji as GitmojiType } from 'gitmojis'

import Gitmoji from './Gitmoji'
import Toolbar from './Toolbar'
import useLocalStorage from './hooks/useLocalStorage'

type Props = {
  gitmojis: readonly GitmojiType[]
}

const GitmojiList = (props: Props) => {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [isListMode, setIsListMode] = useLocalStorage('isListMode', false)

  const gitmojis = searchInput
    ? props.gitmojis.filter(({ emoji, code, description }) => {
        const lowerCasedSearch = searchInput.toLowerCase()

        return (
          code.includes(lowerCasedSearch) ||
          description.toLowerCase().includes(lowerCasedSearch) ||
          emoji == searchInput
        )
      })
    : props.gitmojis

  useEffect(() => {
    if (router.query.search) {
      setSearchInput(router.query.search as string)
    }
  }, [router.query.search])

  useEffect(() => {
    if (router.query.search && !searchInput) {
      router.push('/', undefined, { shallow: true })
    }
  }, [searchInput])

  useEffect(() => {
    const clipboard = new Clipboard(
      '.gitmoji-clipboard-emoji, .gitmoji-clipboard-code'
    )

    clipboard.on('success', function (e) {
      ;(window as any).ga('send', 'event', 'Gitmoji', 'Copy to Clipboard')

      const notification = new (window as any).NotificationFx({
        message: e.trigger.classList.contains('gitmoji-clipboard-emoji')
          ? `<p>Hey! Gitmoji ${e.text} copied to the clipboard 😜</p>`
          : `<p>Hey! Gitmoji <span class="gitmoji-code">${e.text}</span> copied to the clipboard 😜</p>`,
        layout: 'growl',
        effect: 'scale',
        type: 'notice',
        ttl: 2000,
      })

      notification.show()
    })

    return () => clipboard.destroy()
  }, [])

  return (
    <div className="row" id="gitmoji-list">
      <div className="col-xs-12">
        <Toolbar
          isListMode={isListMode}
          searchInput={searchInput}
          setIsListMode={setIsListMode}
          setSearchInput={setSearchInput}
        />
      </div>

      {gitmojis.length === 0 ? (
        <h2>No gitmojis found for search: {searchInput}</h2>
      ) : (
        gitmojis.map((gitmoji, index) => (
          <Gitmoji
            code={gitmoji.code}
            description={gitmoji.description}
            emoji={gitmoji.emoji}
            isListMode={isListMode}
            key={index}
            // @ts-expect-error: This should be replaced with something like:
            // typeof gitmojis[number]['name'] but JSON can't be exported `as const`
            name={gitmoji.name}
          />
        ))
      )}
    </div>
  )
}

export default GitmojiList
