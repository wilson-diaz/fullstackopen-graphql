import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { ALL_AUTHORS, BOOKS_BY_GENRE, CREATE_BOOK } from '../queries'

const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])
  const [favoriteGenre, setFavoriteGenre] = useState('')

  const [ createBook ] = useMutation(CREATE_BOOK, {
    refetchQueries: [ { query: ALL_AUTHORS } ],
    onError: (error) => {
      console.log(error)
    },
    update: (store, response) => {
      props.updateCacheWith(response.data.addBook)
    }
  })

  useEffect(() => {
    if (props.resultCurrentUser.data && props.resultCurrentUser.data.me) {
      setFavoriteGenre(props.resultCurrentUser.data.me.favoriteGenre)
    }
  }, [props.resultCurrentUser.data]) // eslint-disable-line


  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    
    createBook({
      variables: { title, author, published: Number(published), genres },
      update: (cache, response) => { // update user's favorites
        if (favoriteGenre !== '' && response.data.addBook.genres.includes(favoriteGenre)) {
          const dataInCache = cache.readQuery({ query: BOOKS_BY_GENRE, variables: { genre: favoriteGenre }})
          cache.writeQuery({
            query: BOOKS_BY_GENRE,
            variables: { genre: favoriteGenre },
            data: {
              ...dataInCache,
              allBooks: [...dataInCache.allBooks, response.data.addBook]
            }
          })
        }
      }
    })
      .catch(error => console.log(error))

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type='number'
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">add genre</button>
        </div>
        <div>
          genres: {genres.join(' ')}
        </div>
        <button type='submit'>create book</button>
      </form>
    </div>
  )
}

export default NewBook
