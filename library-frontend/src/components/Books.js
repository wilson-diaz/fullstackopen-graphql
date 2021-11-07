import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'

const Books = (props) => {
  const result = useQuery(ALL_BOOKS)
  const [ genreFilter, setGenreFilter ] = useState('all')
 
  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  const genres = new Set()
  result.data.allBooks.forEach(book => {
    book.genres.forEach(genre => {
      if (!genres.has(genre)) {
        genres.add(genre)
      }
    })
  })

  return (
    <div>
      <h2>books</h2>
      <h3>applied filter: {genreFilter}</h3>
      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          { genreFilter === 'all'
              ? result.data.allBooks
                  .map(b =>
                    <tr key={b.title}>
                      <td>{b.title}</td>
                      <td>{b.author.name}</td>
                      <td>{b.published}</td>
                    </tr>
                  )
              : result.data.allBooks
                  .filter(b => b.genres.includes(genreFilter))
                  .map(b =>
                    <tr key={b.title}>
                      <td>{b.title}</td>
                      <td>{b.author.name}</td>
                      <td>{b.published}</td>
                    </tr>
                  )
          }
        </tbody>
      </table>
      <div>
        {
          Array.from(genres).map(genre => {
            return (
              <button key={genre} onClick={() => setGenreFilter(genre)}>{genre}</button>
            )
          })
        }
        <button onClick={() => setGenreFilter('all')}>all</button>
      </div>
    </div>
  )
}

export default Books