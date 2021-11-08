import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { BOOKS_BY_GENRE } from '../queries'

const Recommended = (props) => {
  const [getBooks, resultBooks] = useLazyQuery(BOOKS_BY_GENRE)
  const [favoriteGenre, setFavoriteGenre] = useState('')

  useEffect(() => {
    if (props.resultCurrentUser.data && props.resultCurrentUser.data.me) {
      setFavoriteGenre(props.resultCurrentUser.data.me.favoriteGenre)
      getBooks({ variables: { genre: props.resultCurrentUser.data.me.favoriteGenre }})
    }
  }, [props.resultCurrentUser.data, favoriteGenre]) // eslint-disable-line

  if (!props.show) {
    return null
  }

  if (resultBooks.loading || props.resultCurrentUser.loading) {
    return <div>loading...</div>
  }

  if (!props.resultCurrentUser.data.me) {
    return <div>you must be signed in to use this feature...</div>
  }

  return (
    <div>
      <h2>books</h2>
      <h3>books in your favorite genre: {favoriteGenre}</h3>
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
          { 
            resultBooks.data.allBooks
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
    </div>
  )
}

export default Recommended