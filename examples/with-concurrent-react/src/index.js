import React from 'react';
import ReactDOM from 'react-dom';
import { Container, ThemeProvider } from 'fannypack';
import * as Loads from 'react-loads';

import * as api from './api';
import MovieDetails from './MovieDetails';
import MovieList from './MovieList';

function getMovieLoaders(movieId) {
  return {
    movie: Loads.preload('movie', api.getMovie, { variables: [movieId] }),
    reviews: Loads.preload('movieReviews', api.getReviewsByMovieId, { variables: [movieId] })
  };
}

const initialMovieResource = getMovieLoaders(1);

function App() {
  const [startTransition] = React.useTransition({ timeoutMs: 1000 });
  const [movieResource, setMovieResource] = React.useState(initialMovieResource);
  const [showDetails, setShowDetails] = React.useState(false);
  const [currentMovieId, setCurrentMovieId] = React.useState();

  function handleClickBack() {
    setCurrentMovieId();
    setShowDetails(false);
  }

  function handleSelectMovie(movie) {
    const movieResource = getMovieLoaders(movie.id);
    setMovieResource(movieResource);
    setCurrentMovieId(movie.id);

    startTransition(() => {
      setShowDetails(true);
    });
  }

  return (
    <ThemeProvider>
      <Container breakpoint="mobile" padding="major-2">
        <React.Suspense fallback={<div>loading...</div>}>
          {showDetails ? (
            <MovieDetails movieResource={movieResource} onClickBack={handleClickBack} />
          ) : (
            <MovieList loadingMovieId={currentMovieId} onSelectMovie={handleSelectMovie} />
          )}
        </React.Suspense>
      </Container>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
