# Getting started with development

System requirements:

```text
NodeJs
Docker
```

### Environment variables

All environment variables you will need for the application to run are demonstrated for you in the file `env.example`.

### The database

The p4nth3rbot-mainframe uses a MongoDB to store non-relational documents.

To spin up the docker container and database instance, open terminal and run:

```text
cd path/to/repo
docker-compose up
```

Access the database UI at: `http://localhost:8081/db/p4nth3rb0t/`

### Running the application

In a separate terminal tab, run:

```text
cd path/to/repo
npm run dev
```
