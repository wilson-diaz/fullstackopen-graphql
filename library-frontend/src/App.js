import React, { useState } from 'react'
import { useApolloClient, useLazyQuery, useSubscription } from '@apollo/client'
import { BOOK_ADDED, CURRENT_USER } from './queries'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommended from './components/Recommended'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)

  const [getCurrentUser, resultCurrentUser] = useLazyQuery(CURRENT_USER, {
    fetchPolicy: 'no-cache'
  })

  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      alert(`New book added: "${subscriptionData.data.bookAdded.title}"`)
    }
  })

  const handleLogout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        { 
          token
            ? <><button onClick={() => setPage('add')}>add book</button>
              <button onClick={() => setPage('recommended')}>recommended</button>
              <button onClick={handleLogout}>logout</button></>
            : <button onClick={() => setPage('login')}>login</button>
        }
      </div>

      <Authors
        show={page === 'authors'}
      />

      <Books
        show={page === 'books'}
      />

      <NewBook
        show={page === 'add'}
        resultCurrentUser={resultCurrentUser}
      />

      <Recommended
        show={page === 'recommended'}
        token={token}
        resultCurrentUser={resultCurrentUser}
      />

      <LoginForm
        show={page === 'login'}
        setToken={setToken}
        getCurrentUser={getCurrentUser}
      />

    </div>
  )
}

export default App
