create  TABLE users(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR CHECK (first_name ~ '^[a-zA-Z]+$'),
    last_name VARCHAR CHECK (last_name ~ '^[a-zA-Z]+$') ,
    email VARCHAR UNIQUE NOT NULL CHECK (email ~ '^[a-zA-Z0-9.!#$%&"*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$'),
    phone VARCHAR CHECK (phone ~ '^[0-9]+$'),
    password VARCHAR(255) NOT NULL
);
