/speckit.constitution Create principles based on code quality and readability, using latest testing and linting standards. These principles should adhere to SOLID design principles. Front end should prioritise user experience with a modern CSS framework. The technology stack should utilise a React front end with Typescript, a Typescript API using TypeORM writing to a MySQL database. The application should run in a docker container.

/speckit.constitution Add a branching strategy to the constitution. We will utilise GitHub flow for branching. Each branch should be prefixed with the type of change intended, for example a bug fix should be prefixed with bug/ whereas a new feature should be prefixed with feature/. Commits should also be prefixed with the above pattern

/speckit.constitution Please add in API design standards to the constitution. The application should follow a versioned RESTful structure and utilise correct HTTP status codes for responses. The API should be fully discoverable and documented utilising Swagger. Error handling should be handled internally without passing information back to the user while enabling an engineer to investigate errors utilising the logs and observability. Secrets should never be committed to the codebase - when adding features and fixes we should endeavour to ensure that all dependencies of the application are up to date and we do a security review on every change made. PRs should ideally be less than 500 lines changed per file, with a soft limit of 20 files changed per change. New packages should be evaluated before adding for maintenance status, licencing and impact to application performance.

/speckit.constitution Please add a section for testing methodology. We should adhere to the testing pyramid with unit tests for all logic with external dependencies mocked out, and end-to-end suite that tests each feature with a mocked database in docker, and user centric testing for UI features using playwright

Please update the README to align with the constitution

/speckit.specify Build me an application that allows me to capture the dimensions of each room in the house. Each room should support a dimension for the floor and the ceiling, with the ability to support none square or rectangular shapes. Each wall should support optionally the ability to include a window which should also have dimensions set that can be viewed when viewing the wall. These dimensions should be able to be added/edited/deleted as well as labeled. The room should also be labeled and support the ability to define which floor the room is on. 

/speckit.clarify

/speckit.plan
