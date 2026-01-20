import { useState, useEffect, useRef } from 'react'

export function useAutoShuffle(items, shuffleInterval = 10000, maxItems = 6) {
  const [shuffledItems, setShuffledItems] = useState([])
  const intervalRef = useRef(null)

  // Shuffle array function
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, maxItems)
  }

  // Initial shuffle
  useEffect(() => {
    if (items?.length > 0) {
      setShuffledItems(shuffleArray(items))
    }
  }, [items])

  // Auto shuffle at intervals
  useEffect(() => {
    if (items?.length > 0 && shuffleInterval > 0) {
      intervalRef.current = setInterval(() => {
        setShuffledItems(prev => {
          const remainingItems = items.filter(item => 
            !prev.some(shuffledItem => shuffledItem.link === item.link)
          )
          
          if (remainingItems.length === 0) {
            return shuffleArray(items)
          }
          
          const newItems = [...prev.slice(1), 
            remainingItems[Math.floor(Math.random() * remainingItems.length)]
          ]
          
          return newItems
        })
      }, shuffleInterval)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [items, shuffleInterval])

  return shuffledItems
}
