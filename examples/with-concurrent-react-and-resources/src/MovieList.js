import React from 'react';
import { Box, Heading, LayoutSet } from 'fannypack';

import MovieListButton from './MovieListButton';
import { moviesResource, movieResource, movieReviewsResource } from './resources';

export default function MovieList(props) {
  const { loadingMovieId, onSelectMovie } = props;

  const moviesLoader = moviesResource.useLoads({ suspense: true });
  const movies = moviesLoader.response || [];

  return (
    <Box>
      <Heading>Jake's Top Movies</Heading>
      <LayoutSet spacing="major-2">
        {movies.map(movie => (
          <MovieListButton
            key={movie.id}
            isLoading={movie.id === loadingMovieId}
            movie={movie}
            onClick={() => onSelectMovie(movie)}
          />
        ))}
      </LayoutSet>
    </Box>
  );
}
