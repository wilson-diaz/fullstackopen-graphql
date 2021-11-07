import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, EDIT_BORN } from '../queries'

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS)
  const [ changeBorn ] = useMutation(EDIT_BORN, {
    onError: (error) => {
      console.log(error)
    }
  })

  const [ bornValue, setBornValue ] = useState('')
  const [ selectedAuthor, setSelectedAuthor ] = useState('')
  
  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  const authors = result.data.allAuthors

  const handleSubmit = (event) => {
    event.preventDefault()
    changeBorn({ variables: { name: selectedAuthor, setBornTo: Number(bornValue) } })
      .catch(error => console.log(error))
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th>
              name
            </th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>

      <h3>Set birthyear</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Select an author to edit:
          <select onChange={({ target }) => setSelectedAuthor(target.value)}>
            {authors.map(a => {
              return (
                <option key={a.id} value={a.name}>{a.name}</option>
              )
            })}
          </select>
        </label>
        <br />
        <label>
          Enter value:
          <input
            value={bornValue}
            onChange={({ target }) => setBornValue(target.value)}
          />
        </label>
        <br />
        <button type='submit'>update author</button>
      </form>
    </div>
  )
}

export default Authors
