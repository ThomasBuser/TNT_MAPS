-- Create the directors table
CREATE TABLE directors (
    director_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    birth_date DATE,
    nationality VARCHAR(50)
) ENGINE=InnoDB;

-- Create the movies table
CREATE TABLE movies (
    movie_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    director_id INT,
    release_date DATE,
    genre VARCHAR(50),
    rating VARCHAR(5),
    CONSTRAINT fk_director
        FOREIGN KEY (director_id) 
        REFERENCES directors(director_id)
) ENGINE=InnoDB;

-- Insert directors
INSERT INTO directors (first_name, last_name, birth_date, nationality)
VALUES 
('Christopher', 'Nolan', '1970-07-30', 'British'),
('Quentin', 'Tarantino', '1963-03-27', 'American'),
('Sofia', 'Coppola', '1971-05-14', 'American'),
('Kathryn', 'Bigelow', '1951-11-27', 'American');

-- Insert movies for each director
INSERT INTO movies (title, director_id, release_date, genre, rating)
VALUES 
('Inception', (SELECT director_id FROM directors WHERE last_name = 'Nolan'), '2010-07-16', 'Science fiction', 'PG-13'),
('Dunkirk', (SELECT director_id FROM directors WHERE last_name = 'Nolan'), '2017-07-21', 'War', 'PG-13'),
('The Dark Knight', (SELECT director_id FROM directors WHERE last_name = 'Nolan'), '2008-07-18', 'Action', 'PG-13'),
('Pulp Fiction', (SELECT director_id FROM directors WHERE last_name = 'Tarantino'), '1994-10-14', 'Crime', 'R'),
('Django Unchained', (SELECT director_id FROM directors WHERE last_name = 'Tarantino'), '2012-12-25', 'Western', 'R'),
('Kill Bill: Vol. 1', (SELECT director_id FROM directors WHERE last_name = 'Tarantino'), '2003-10-10', 'Action', 'R'),
('Lost in Translation', (SELECT director_id FROM directors WHERE last_name = 'Coppola'), '2003-10-03', 'Drama', 'R'),
('The Virgin Suicides', (SELECT director_id FROM directors WHERE last_name = 'Coppola'), '2000-04-21', 'Drama', 'R'),
('The Hurt Locker', (SELECT director_id FROM directors WHERE last_name = 'Bigelow'), '2008-10-10', 'War', 'R'),
('Zero Dark Thirty', (SELECT director_id FROM directors WHERE last_name = 'Bigelow'), '2012-12-19', 'Thriller', 'R'),
('Point Break', (SELECT director_id FROM directors WHERE last_name = 'Bigelow'), '1991-07-12', 'Action', 'R');

-- Create the actors table
CREATE TABLE actors (
    actor_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    birth_date DATE,
    nationality VARCHAR(50)
) ENGINE=InnoDB;

-- Create the movie_actors junction table
CREATE TABLE movie_actors (
    movie_id INT,
    actor_id INT,
    PRIMARY KEY (movie_id, actor_id),
    CONSTRAINT fk_movie
        FOREIGN KEY (movie_id) 
        REFERENCES movies(movie_id),
    CONSTRAINT fk_actor
        FOREIGN KEY (actor_id) 
        REFERENCES actors(actor_id)
) ENGINE=InnoDB;

-- Insert actors
INSERT INTO actors (first_name, last_name, birth_date, nationality)
VALUES 
('Leonardo', 'DiCaprio', '1974-11-11', 'American'),
('Uma', 'Thurman', '1970-04-29', 'American'),
('Christian', 'Bale', '1974-01-30', 'British'),
('Scarlett', 'Johansson', '1984-11-22', 'American'),
('Jeremy', 'Renner', '1971-01-07', 'American');

-- Link actors to movies using movie_actors junction table

-- Leonardo DiCaprio in Inception
INSERT INTO movie_actors (movie_id, actor_id)
VALUES (
    (SELECT movie_id FROM movies WHERE title = 'Inception'),
    (SELECT actor_id FROM actors WHERE first_name = 'Leonardo' AND last_name = 'DiCaprio')
);

-- Uma Thurman in Pulp Fiction and Kill Bill: Vol. 1
INSERT INTO movie_actors (movie_id, actor_id)
VALUES 
(
    (SELECT movie_id FROM movies WHERE title = 'Pulp Fiction'),
    (SELECT actor_id FROM actors WHERE first_name = 'Uma' AND last_name = 'Thurman')
),
(
    (SELECT movie_id FROM movies WHERE title = 'Kill Bill: Vol. 1'),
    (SELECT actor_id FROM actors WHERE first_name = 'Uma' AND last_name = 'Thurman')
);

-- Christian Bale in The Dark Knight
INSERT INTO movie_actors (movie_id, actor_id)
VALUES (
    (SELECT movie_id FROM movies WHERE title = 'The Dark Knight'),
    (SELECT actor_id FROM actors WHERE first_name = 'Christian' AND last_name = 'Bale')
);

-- Scarlett Johansson in Lost in Translation
INSERT INTO movie_actors (movie_id, actor_id)
VALUES (
    (SELECT movie_id FROM movies WHERE title = 'Lost in Translation'),
    (SELECT actor_id FROM actors WHERE first_name = 'Scarlett' AND last_name = 'Johansson')
);

-- Jeremy Renner in The Hurt Locker
INSERT INTO movie_actors (movie_id, actor_id)
VALUES (
    (SELECT movie_id FROM movies WHERE title = 'The Hurt Locker'),
    (SELECT actor_id FROM actors WHERE first_name = 'Jeremy' AND last_name = 'Renner')
);
