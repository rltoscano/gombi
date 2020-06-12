# Description

Gombi contains:

* Personal showcase of my technology projects
* A Google App Engine application that hosts a remote door-opening service. Users can create, share, and open doors using this service.

# Server

## Deployment

1. appcfg.py --oauth2 update server

# Development

## Webapp

### Dependency Management

The webapp uses `npm` to manage dependencies. Example of installing a dependency:

```
npm install @polymer/decorators
```

Will result in a change to the `package.json` file and code pulled into `node_modules/@polymer/decorators`.

### Building and Testing

1. Compile all the typescript: `tsc`.
2. Run a local webserver: `polymer serve`.
