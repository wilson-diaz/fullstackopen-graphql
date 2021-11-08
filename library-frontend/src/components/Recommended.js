import React from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'

const Recommended = (props) => {
  const resultBooks = useQuery(ALL_BOOKS)

  if (!props.show) {
    return null
  }

  if (resultBooks.loading || props.resultCurrentUser.loading) {
    return <div>loading...</div>
  }

  if (!props.resultCurrentUser.data.me) {
    return <div>you must be signed in to use this feature...</div>
  }


  const favoriteGenre = props.resultCurrentUser.data.me.favoriteGenre

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
              .filter(b => b.genres.includes(favoriteGenre))
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