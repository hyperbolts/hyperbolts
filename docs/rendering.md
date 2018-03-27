# HyperBolts: Rendering Data
When your component renders, the data sources it uses can be either already loaded, not loaded yet, or some sources are loaded and some are not. HyperBolts empowers you with the ability to discover these states and code in appropriate UI should you need to.

For each data source linked to your component, HyperBolts attaches some useful extra properties that help you to provide a polished UI.

## Data source structure
When a data source is loading the object passed in as the `this.props.data.<keyName>` property has the following structure:

```
{
    error:   [true/false],          // The current error state
    loading: [true/false],          // The current loading state
    source:  "<data source path>",  // The path as configured in the data source definition
    updated: <timestamp>,           // Time stamp of when the source was last refreshed
    values:  [{<row 1>}, {<row n>}] // The actual data values
}
```

## Determining data source state
Using the Data source structure, it is possible to determine what UI to render for various states the user is likely to care about. So, assuming we have already defined a data source that we gave a key name of `'users'`, we can determine data source state in the following ways:

```
render() {
    let loading = this.props.data.users.loading;  // Get the data source loading state
    let loaded  = !this.props.data.users.loading; // Get the data source loaded state
    let error   = this.props.data.users.error;    // Get the data source error state
}
```

## Rendering examples
### Simple render
Assuming we have two data sources defined, `endPointData` and `secondEndPointData`, the simplest render we could do would be to just output values disregarding any state information. This is possible when defensive coding is used, but would not give a great user experience.

In this example, the user could very well see the length being reported as '0' before the data has loaded, and then suddenly be updated when the data sources finally load.

```
// Render component
render() {
    const endPointData       = this.props.data.endPointData.values || [],
          secondEndPointData = this.props.data.secondEndPointData.values || [];

    return (
        <div>
            There are {endPointData.length} row(s) in endPointData, and
            {secondEndPointData.length} row(s) in secondEndPointData.
        </div>
    );
}
```

### Rendering with loading notification
The same example can be easily updated to improve the user experience; this time we'll just output a 'Loading...' message whilst the data sources are loading.

```
// Render component
render() {
    const endPointData       = this.props.data.endPointData.values || [],
          secondEndPointData = this.props.data.secondEndPointData.values || [],
          loading            = endPointData.loading || secondEndPointData.loading;

    // If any data is still loading, display loading message
    if(loading) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    // All data has loaded, so display complete component 
    return (
        <div>
            There are {endPointData.length} row(s) in endPointData, and
            {secondEndPointData.length} row(s) in secondEndPointData.
        </div>
    );
}
```

## Notes
The render method may be called when not all data is available yet and so defensive coding is recommended (such as `const data = this.props.data.users.values || [];`) to avoid bugs caused by APIs that have a variable execution time.
