const actionDb = require('./data/helpers/actionModel.js');
const projectDb = require('./data/helpers/projectModel.js');
const express = require('express');
const cors = require('cors');

const server = express();
server.use(cors());
server.use(express.json());

const toCaps = (request, response, next) => {
    request.name = request.body.name.toUpperCase();
    next();
};

const port = 8000;
server.listen(port, () =>
    console.log(`Server is listening to Port ${port}`)
);

// ACTION API
server.get('/api/actions', (request, response) => {
    actionDb
        .get()
        .then(actions => {
            return response
                .status(200)
                .json(actions);
        })
        .catch(() => {
            return response
                .status(500)
                .json({ Error: "Could not find list of actions." })
        });
});

server.get('/api/actions/:id', (request, response) => {
    const id = request.params.id;

    actionDb
        .get(id)
        .then(action => {
            if (!action) {
                return response
                    .status(404)
                    .json({ Error: "Could not find action." })
            } else return response
                .status(200)
                .json(action);
        })
        .catch(() => {
            return response
                .status(500)
                .json({ Error: "Action info could not be retrieved." })
        });
});

server.post('/api/actions', (request, response) => {
    const projectID = request.projectID;
    const description = request.description;
    const completed = request.completed;
    const notes = request.notes;
    const newAction = { projectID, description, notes, completed };

    if (!newAction.projectID || !newAction.description || !newAction.completed) {
        return response
            .status(400)
            .send({ Error: "Please enter a projectID, description, or completion value for the action" });
    } else if (newAction.description.length > 128) {
        return response
            .status(400)
            .send({ Error: "Action description must be 128 or less characters" });
    }

    actionDb
        .insert(newAction)
        .then(actionID => {
            const { id } = actionID;
            actionDb
                .get(id)
                .then(action => {
                    return response
                        .status(201)
                        .json(action);
                });
        })
        .catch(() => {
            return response
                .status(500)
                .json({ Error: "There was an error while saving the action" })
        });
});

server.put('/api/actions/:id', (request, response) => {
    const id = request.params.id;
    const projectID = request.projectID;
    const description = request.description;
    const completed = request.completed;
    const notes = request.notes;
    const updatedAction = { projectID, description, notes, completed };

    if (!id) {
        return response
            .status(404)
            .send({ Error: `Action with the following ID does not exist: ${id}` });
    } else if (!updatedAction.name) {
        return response
            .status(400)
            .send({ Error: "Please enter a name for the action" });
    }

    actionDb
        .update(id, updatedAction)
        .then(action => {
            return response
                .status(200)
                .json(action);
        })
        .catch(() => {
            return response
                .status(500)
                .json({ Error: "The action info could not be modified" })
        });
});

server.delete('/api/actions/:id', (request, response) => {
    const id = request.params.id;

    if (!id) {
        return response
            .status(404)
            .json({ Error: `There is no action with the following ID: ${id}` })
    }

    actionDb
        .remove(id)
        .then(removedAction => {
            return response
                .status(200)
                .json(removedAction);
        })
        .catch(() => {
            return response
                .status(500)
                .json({ Error: "The action could not be removed" })
        });
});

// PROJECT API
server.get('/api/projects', (request, response) => {
    projectDb
        .get()
        .then(projects => {
            return response
                .status(200)
                .json(projects);
        })
        .catch(() => {
            return response
                .status(500)
                .json({ Error: "Could not find list of projects." })
        });
});

server.get('/api/projects/:id', (request, response) => {
    const id = request.params.id;

    projectDb
        .get(id)
        .then(project => {
            if (!project) {
                return response
                    .status(404)
                    .json({ Error: "Could not find project." })
            } else return response
                .status(200)
                .json(project);
        })
        .catch(() => {
            return response
                .status(500)
                .json({ Error: "Project info could not be retrieved." })
        });
});

server.get('/api/project/:id/actions', (request, response) => {
    const id = request.params.id;

    projectDb
        .getProjectActions(id)
        .then(projectActions => {
            return response
                .status(200)
                .json(projectActions);
        })
        .catch(() => {
            return response
                .status(500)
                .json({ Error: "Project action info could not be retrieved." })
        });
});

server.post('/api/project', (request, response) => {
    const projectID = request.body.projectID;
    const text = request.body.text;
    const newProject = { projectID, text };

    if (!newProject.projectID || !newProject.text) {
        return response
            .status(400)
            .send({ Error: "Missing projectID or text for the project" });
    }

    projectDb
        .insert(newProject)
        .then(project => {
            projectDb
                .get(project.id)
                .then(project => {
                    return response
                        .status(201)
                        .json(project);
                });
        })
        .catch(() => {
            return response
                .status(500)
                .json({ Error: "There was an error while saving the project" })
        });
});

server.put('/api/projects/:id', (request, response) => {
    const id = request.params.id;
    const text = request.body.text;
    const updatedProject = { text };

    if (!id) {
        return response
            .status(404)
            .send({ Error: `Project with the following ID does not exist: ${id}` });
    } else if (!updatedProject.text) {
        return response
            .status(400)
            .send({ Error: "Please enter text for the project" });
    }

    projectDb
        .update(id, updatedProject)
        .then(project => {
            return response
                .status(200)
                .json(project);
        })
        .catch(() => {
            return response
                .status(500)
                .json({ Error: "The project info could not be modified" })
        });
});

server.delete('/api/projects/:id', (request, response) => {
    const id = request.params.id;

    if (!id) {
        return response
            .status(404)
            .json({ Error: `There is no project with the following ID: ${id}` })
    }

    projectDb
        .remove(id)
        .then(removedProject => {
            return response
                .status(200)
                .json(removedProject);
        })
        .catch(() => {
            return response
                .status(500)
                .json({ Error: "The project could not be removed" })
        });
});